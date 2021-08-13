import { html, css, SkhemataBase, property, CSSResult } from '@skhemata/skhemata-base';
import {
  SkhemataForm,
  SkhemataFormTextbox,
  SkhemataFormButton,
} from '@skhemata/skhemata-form';
import { SkhemataRegisterStyle } from './style/SkhemataRegisterStyle';
import { defaultTranslationEng } from './translation/eng';

export class SkhemataRegister extends SkhemataBase {

  @property({type: Object})
  translationData = {
    eng: defaultTranslationEng
  }; 

  @property({type: String})
  errorMessage = "";

  @property({type: String})
  successMessage = "";

  @property({type: Boolean})
  signingUp = false;

  private isLoading = false;

  static get scopedElements() {
    return {
      'sf-form': SkhemataForm,
      'sf-textbox': SkhemataFormTextbox,
      'sf-button': SkhemataFormButton,
    }
  }

  static get styles() {
    return <CSSResult[]> [
      ...super.styles,
      SkhemataRegisterStyle
    ];
  }

  validate = (json: any) => {
    var pw = json.password as string;
    var pwc = json.password_confirm as string;
    if (pw !== pwc) return { error: true, message: 'password_match_error'};
    return {error:false, message:""};
  }

  handleSubmit = (e: any) => {
    const form = e.detail.data;
    this.isLoading = true;
    this.requestUpdate();
    this.skhemata?.register({
      first_name: form.firstName,
      last_name: form.lastName,
      email: form.email,
      password: form.password,
      password_confirm: form.passwordConfirm,
    }).then(() => {
      this.isLoading = false;
      this.successMessage = this.getStr('SkhemataRegister.registrationSuccessful')
      this.requestUpdate();
    }).catch((err) => {
      this.isLoading = false;
      this.errorMessage = this.getStr('SkhemataRegister.registrationFailed')
    });

  }

  clearMessage = () => {
    this.errorMessage = "";
  }
  
  async firstUpdated(){
    await super.firstUpdated();
    console.log(this.translationData);
    console.log(this.translationLang);
    console.log(this.getStr('SkhemataRegister.firstName'))
  }

  render() {
    return html`
    <sf-form class="control is-family-primary is-fullwidth login-form" @submit="${this.handleSubmit}">
      <sf-textbox label="${this.getStr('SkhemataRegister.firstName')}" name="firstName" required></sf-textbox>
      <sf-textbox label="${this.getStr('SkhemataRegister.lastName')}" name="lastName" required></sf-textbox>
      <sf-textbox label="${this.getStr('SkhemataRegister.email')}" name="email" required></sf-textbox>
      <sf-textbox label="${this.getStr('SkhemataRegister.password')}" name="password" type="password" required></sf-textbox>
      <sf-textbox label="${this.getStr('SkhemataRegister.confirmPassword')}" name="passwordConfirm" type="password" required></sf-textbox>
      <sf-button type="submit" title="${ this.isLoading ? '' : this.getStr('SkhemataRegister.submit')}" isfullwidth></sf-button>
    </sf-form>
    ${
      this.errorMessage.length > 0 
        ? html`
            <div class="is-family-primary notification is-danger mt-4">
              <a class="delete" @click=${this.clearMessage}></a>
              ${this.errorMessage}
            </div>` 
        : ''
    }
    ${
      this.successMessage.length > 0 
        ? html`
            <div class="is-family-primary notification is-success mt-4">
              <a class="delete" @click=${this.clearMessage}></a>
              ${this.successMessage}
            </div>` 
        : ''
    }
    `;
  }
}
