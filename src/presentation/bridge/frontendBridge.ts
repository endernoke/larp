export type PanelId = 'phone' | 'planner' | 'resume';

export interface LocationInteraction {
  locationId: string;
  panel: PanelId;
}

export interface UIBlockInputEvent {
  blocked: boolean;
}

export interface FrontendEvents {
  'panel:open': { panel: PanelId };
  'location:nearby': { label: string | null };
  'location:interact': LocationInteraction;
  'ui:block-input': UIBlockInputEvent;
  'scene:ready': undefined;
}

type EventName = keyof FrontendEvents;
type Listener<T extends EventName> = (payload: FrontendEvents[T]) => void;

class FrontendBridge {
  private readonly target = new EventTarget();

  emit<T extends EventName>(name: T, payload: FrontendEvents[T]): void {
    this.target.dispatchEvent(new CustomEvent(name, { detail: payload }));
  }

  on<T extends EventName>(name: T, listener: Listener<T>): () => void {
    const handler = (event: Event) => {
      listener((event as CustomEvent<FrontendEvents[T]>).detail);
    };

    this.target.addEventListener(name, handler);
    return () => this.target.removeEventListener(name, handler);
  }
}

// Presentation-only bridge. Future integration should translate these UI/game
// gestures into typed backend actions instead of placing game rules here.
export const frontendBridge = new FrontendBridge();
