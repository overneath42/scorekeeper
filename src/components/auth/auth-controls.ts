import { html, nothing, TemplateResult } from "lit";
import { customElement, state } from "lit/decorators.js";
import { createRef, ref, Ref } from "lit/directives/ref.js";
import { BaseComponent } from "@/utils";
import type { ModalComponent } from "@/components/modal/modal.js";

interface AuthUser {
  displayName: string | null;
  photoURL: string | null;
}

@customElement("x-auth-controls")
export class AuthControlsComponent extends BaseComponent {
  @state() private user: AuthUser | null = null;
  @state() private loading = true;
  @state() private signingIn = false;

  private modalRef: Ref<ModalComponent> = createRef();

  connectedCallback() {
    super.connectedCallback();
    this.initAuth();
  }

  private async initAuth() {
    if (!import.meta.env.VITE_FIREBASE_API_KEY) {
      this.loading = false;
      return;
    }

    try {
      const { auth } = await import("@/services/firebase.js");
      await auth.authStateReady();
      if (auth.currentUser) {
        this.user = {
          displayName: auth.currentUser.displayName,
          photoURL: auth.currentUser.photoURL,
        };
      }
    } catch {
      // Firebase not available — stay in signed-out state
    }
    this.loading = false;
  }

  private openSignInModal() {
    this.modalRef.value?.open({
      title: "Sign In",
      content: html`
        <p class="text-gray-600 mb-6">
          Sign in with your Google account to sync your games across devices.
        </p>
        <button
          type="button"
          class="w-full btn btn-common flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-gray-700"
          ?disabled=${this.signingIn}
          @click=${this.handleGoogleSignIn}>
          ${this.signingIn
            ? html`<span class="text-sm text-gray-500">Signing in...</span>`
            : html`
                <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                  <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
                  <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                  <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 6.29C4.672 4.163 6.656 2.58 9 2.58z" fill="#EA4335"/>
                </svg>
                <span>Sign in with Google</span>
              `}
        </button>
      `,
      size: "sm",
    });
  }

  private handleGoogleSignIn = async () => {
    this.signingIn = true;
    this.requestUpdate();
    // Re-render modal content with loading state
    this.openSignInModal();

    try {
      const { signIn, activateSync, auth } = await import("@/services/firebase.js");
      const userId = await signIn();
      if (userId && auth.currentUser) {
        this.user = {
          displayName: auth.currentUser.displayName,
          photoURL: auth.currentUser.photoURL,
        };
        await activateSync(userId);
        this.modalRef.value?.close();
      }
    } catch (err) {
      console.error("Sign-in failed:", err);
    } finally {
      this.signingIn = false;
    }
  };

  private openSignOutModal() {
    this.modalRef.value?.open({
      title: "Sign Out",
      content: html`
        <p class="text-gray-600 mb-6">
          Your games are saved to the cloud and will be here when you sign back in.
        </p>
        <div class="flex gap-2 justify-end">
          <button
            type="button"
            class="btn btn-secondary-outline"
            @click=${() => this.modalRef.value?.close()}>
            Cancel
          </button>
          <button
            type="button"
            class="btn btn-error"
            @click=${this.handleSignOut}>
            Sign Out
          </button>
        </div>
      `,
      size: "sm",
    });
  }

  private handleSignOut = async () => {
    this.modalRef.value?.close();
    try {
      const { signOut } = await import("@/services/firebase.js");
      await signOut();
      this.user = null;
    } catch (err) {
      console.error("Sign-out failed:", err);
    }
  };

  render() {
    if (this.loading || !import.meta.env.VITE_FIREBASE_API_KEY) {
      return html``;
    }

    if (this.user) {
      return html`
        <div class="flex items-center gap-2">
          ${this.user.photoURL
            ? html`<img
                src="${this.user.photoURL}"
                alt="${this.user.displayName ?? "User"}"
                class="w-8 h-8 rounded-full"
                referrerpolicy="no-referrer" />`
            : nothing}
          <button
            type="button"
            class="btn-sm btn-secondary-outline"
            @click=${() => this.openSignOutModal()}>
            Sign Out
          </button>
        </div>
        <x-modal ${ref(this.modalRef)}></x-modal>
      `;
    }

    return html`
      <button
        type="button"
        class="btn-sm btn-secondary-outline"
        @click=${() => this.openSignInModal()}>
        Sign In
      </button>
      <x-modal ${ref(this.modalRef)}></x-modal>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "x-auth-controls": AuthControlsComponent;
  }
}
