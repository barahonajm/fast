import { attr, FASTElement, observable, DOM } from "@microsoft/fast-element";
import {
    keyCodeSpace,
    keyCodeEnter,
    wrapInBounds,
    limit,
    KeyCodes,
} from "@microsoft/fast-web-utilities";

/**
 * The panel id prefix
 * @public
 */
export const tabPanelPrefix: string = "panel-";

const tabPrefix: string = "tab-";

/**
 * An Carousel Custom HTML Element.
 * Implements the {@link https://www.w3.org/TR/wai-aria-1.1/#carousel | ARIA carousel }.
 *
 * @public
 */
export class Carousel extends FASTElement {
    @attr({ mode: "fromView" })
    public autoplay: boolean = true;

    @attr({ mode: "fromView" })
    public loop: boolean = true;

    @attr({ mode: "boolean" })
    public paused: boolean = false;
    public pausedChanged(): void {
        if (!this.paused) {
            this.focused = false;
            this.startAutoPlay();
        } else {
            this.stopAutoPlay();
        }
        if (this.change) {
            this.change();
        }
    }

    @attr({ attribute: "nottabbedpattern", mode: "boolean" })
    public notTabbedPattern: boolean = false;

    @attr({ attribute: "autoplay-interval" })
    public autoplayInterval: number = 6000;

    @attr({ attribute: "activeid" })
    public activeid: string;
    public activeidChanged(): void {
        this.activeIndex = this.tabIds.indexOf(this.activeid);
    }

    @attr({ attribute: "aria-labelledby" })
    public arialabelledby: string;

    @attr({ attribute: "aria-label" })
    public arialabel: string;

    public focused: boolean = false;
    public carousel: HTMLDivElement;
    public tabs: HTMLElement;
    public rotationControl: HTMLElement;
    public previousButtonItem: HTMLElement[];
    public nextButtonItem: HTMLElement[];

    @observable
    public items: HTMLElement[];
    public itemsChanged(): void {
        this.filteredItems = this.items.filter(
            (item: HTMLElement) => item.nodeType === 1
        );
        this.generateTabIds();

        //sethdonohue - if activeid attribute was set by implementation then we need to sync the activeIndex for incrementing to work
        if (this.activeid) {
            this.activeIndex = this.tabIds.indexOf(this.activeid);
        } else {
            this.activeid = this.tabIds[this.activeIndex] as string;
        }

        if (this.notTabbedPattern) {
            this.filteredItems = this.filteredItems.map(
                (item: HTMLElement, index: number) => {
                    if (index === this.activeIndex) {
                        item.classList.add("active-slide");
                        item.removeAttribute("hidden");
                    } else {
                        item.setAttribute("hidden", "");
                    }
                    if (
                        !item.getAttribute("aria-label") ||
                        !item.getAttribute("aria-labelledby")
                    ) {
                        item.setAttribute(
                            "aria-label",
                            `${index + 1} of ${this.filteredItems.length}`
                        );
                    }

                    item.setAttribute("id", `${tabPanelPrefix}${index + 1}`);
                    item.classList.add("slide");
                    // sethdonohue - per ARIA spec role=group and roledescription=slide must be on the slide container for notTabbedPattern (not tabbed) implementation
                    item.setAttribute("role", "group");
                    item.setAttribute("aria-roledescription", "slide");

                    return item;
                }
            );
        }
    }

    @observable
    public filteredItems: HTMLElement[];

    public handleFlipperClick(direction: 1 | -1, e: Event): void {
        this.incrementSlide(direction);
    }

    public handleFlipperKeypress = (direction: 1 | -1, e: KeyboardEvent): void => {
        switch (e.keyCode) {
            case keyCodeEnter:
                this.paused = true;
                this.incrementSlide(direction);
                break;
        }
    };

    private handleRotationMouseDown = (e: Event): void => {
        if (this.firstFocus) {
            this.firstFocus = false;
        }
        this.togglePlay();
    };

    private tabIds: string[] = [];
    private activeIndex: number = 0;
    private autoplayTimer: number | void;
    private pausedTimeout: number | void;
    private firstFocus: boolean = true;
    private startTime: number = 0;
    private stopTime: number = 0;

    private change = (): void => {
        // sethdonohue - reference to carousel is passed for the author to get access to the paused, activeid, and other states
        this.$emit("change", this.carousel);
    };

    private incrementSlide = (direction: 1 | -1): void => {
        if (this.loop) {
            this.activeIndex = wrapInBounds(
                0,
                this.filteredItems.length - 1,
                this.activeIndex + direction
            );
        } else {
            this.activeIndex = limit(
                0,
                this.filteredItems.length - 1,
                this.activeIndex + direction
            );
        }

        this.activeid = this.tabIds[this.activeIndex];

        if (this.notTabbedPattern) {
            this.itemsChanged();
        }
        this.change();
    };

    private autoplayNextItem = (): void => {
        this.startTime = Date.now();
        this.incrementSlide(1);
    };

    private generateTabIds(): void {
        this.tabIds = [];
        for (let i = 0; i < this.filteredItems.length; i++) {
            this.tabIds.push(`${tabPrefix}${i + 1}`);
        }
    }

    private togglePlay(): void {
        this.paused = !this.paused;
    }

    private startAutoPlay(): void {
        if (!this.paused) {
            // sethdonohue - need to clear the timer before starting a new one
            this.stopAutoPlay();
            this.startTime = Date.now();
            this.autoplayTimer = window.setInterval(
                this.autoplayNextItem,
                this.autoplayInterval
            );
        }
    }

    private stopAutoPlay(): void {
        this.autoplayTimer = window.clearInterval(this.autoplayTimer as number);
    }

    private handleFocusIn = (e: Event): void => {
        // sethdonohue - per ARIA spec we need to stop rotation whenever keyboard focus is brought to the carousel
        if (this.autoplay) {
            this.stopAutoPlay();
        }
        // sethdonohue - is the case of a mouse click on rotation controls we want
        if (this.firstFocus) {
            if (this.autoplay) {
                this.paused = true;
            }
            this.firstFocus = false;
        }
        this.focused = true;
    };

    private handleBlur(e: Event): void {
        this.focused = false;
    }

    private handleMouseOver = (e: Event) => {
        if (!this.paused) {
            this.stopTime = Date.now();
            window.clearTimeout(this.pausedTimeout as number);
            this.stopAutoPlay();
        }
    };

    private handleMouseLeave = (e: Event) => {
        if (!this.paused) {
            // sethdonohue - timer for proper pause of rotation
            const timeDiff: number =
                this.autoplayInterval - (this.stopTime - this.startTime);
            if (timeDiff) {
                window.clearTimeout(this.pausedTimeout as number);
                window.clearInterval(this.autoplayTimer as number);
                this.pausedTimeout = setTimeout(() => {
                    this.autoplayNextItem();
                    this.startAutoPlay();
                }, timeDiff);
            }
        }
        this.focused = false;
    };

    private handleTabChange = (e: any): void => {
        if (e.target.activeid) {
            this.activeid = e.target.activeid;
            this.activeIndex = this.tabIds.indexOf(this.activeid);
        }
    };

    private handleTabsKeypress = (e: KeyboardEvent): void => {
        // sethdonohue - pause the carousel if the right, left, home, end keys are pressed in the case of when autoplay has been restarted by the user and the focus is on the tabs
        switch (e.keyCode) {
            case KeyCodes.arrowLeft:
            case KeyCodes.arrowRight:
            case KeyCodes.home:
            case KeyCodes.end:
                this.paused = true;
                break;
        }
    };

    private handleTabsFocusIn = (e: FocusEvent): void => {
        // sethdonohue - when keyboard navigating from the rotation control or a tab we do not want the rotation to be stopped in the case of when a keyboard user restarts the rotation with the rotation control and then has to tab through/past the tablist/slidepicker
        if (
            !this.rotationControl.contains(e.relatedTarget as Node) &&
            !this.tabs.contains(e.relatedTarget as Node)
        ) {
            // sethdonohue - we do want to run the focus in the case where the user is reverse tabbing (shift-tab) back to a carousel and hits the tabs first, as this should stop the auto rotation on first focus per ARIA spec
            this.handleFocusIn(e);
        }
        this.focused = true;
    };

    private handleTabsFocusOut = (e: FocusEvent): void => {
        // sethdonohue - if we focus out of tabs or any tabs children we need to ensure tabs doesn't steal focus
        this.focused = false;
        this.firstFocus = true;
    };

    public connectedCallback(): void {
        super.connectedCallback();
        if (this.autoplay) {
            this.startAutoPlay();
        } else {
            this.paused = true;
        }

        // sethdonohue - per ARIA autoplay must pause when mouse is hovering over the carousel
        this.carousel.addEventListener("mouseover", this.handleMouseOver);
        this.carousel.addEventListener("mouseleave", this.handleMouseLeave);

        // sethdonohue - per ARIA rotating must stop when keyboard focus enters the carousel and not restart unless the user explicitly requests it to.
        this.carousel.addEventListener("focusin", this.handleFocusIn);
        this.carousel.addEventListener("blur", this.handleBlur);

        // sethdonohue - using mousedown as this fires before focus so we can account for the first click on the rotation control and the focus immediately following click. This also requires the use on keydown since click is not used
        this.rotationControl.addEventListener("mousedown", this.handleRotationMouseDown);
        this.rotationControl.addEventListener("keydown", e => {
            if (e.keyCode === keyCodeSpace || e.keyCode === keyCodeEnter) {
                this.handleRotationMouseDown(e);
            }
        });

        if (!this.notTabbedPattern) {
            this.tabs.addEventListener("keydown", this.handleTabsKeypress);
            this.tabs.addEventListener("focusin", this.handleTabsFocusIn);
            this.tabs.addEventListener("focusout", this.handleTabsFocusOut);

            // sethdonohue - get the id of the tab change based on the change event emitted from tabs to keep carousel in sync with tabs
            this.tabs.addEventListener("change", this.handleTabChange);

            if (this.previousButtonItem.length && this.nextButtonItem.length) {
                // sethdonohue - when tabbed the next and previous buttons should not be in the tab sequence
                DOM.queueUpdate(() => {
                    this.previousButtonItem[0].setAttribute("tabindex", "-1");
                    this.nextButtonItem[0].setAttribute("tabindex", "-1");
                });
            }
        }
    }

    public disconnectedCallback(): void {
        super.disconnectedCallback();
        this.stopAutoPlay();
    }
}
