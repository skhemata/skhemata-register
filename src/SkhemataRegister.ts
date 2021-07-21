import { html, css, LitElement, property } from 'lit-element';
import { get, registerTranslateConfig, use } from 'lit-translate';
import { Bulma } from 'skhemata-css';

export class SkhemataRegister extends LitElement {

  @property({ type: String, attribute: 'api-url' })
  postUrl = '';

  @property({type: String, attribute: 'translation-dir'})
  translationsDirectory = '';

  @property({type: String, attribute: 'translation-lang'})
  translationsLang = 'en';

  constructor() {
    super();
    registerTranslateConfig({
      loader: lang => fetch(`${this.translationsDirectory}${lang}.json`).then(res => {
        return res.json();
      })
    });
  }

  // Defer the first update of the component until the strings has been loaded to avoid empty strings being shown
  hasLoadedStrings = false;
  protected shouldUpdate (changedProperties: any) {
    return this.hasLoadedStrings && super.shouldUpdate(changedProperties);
  }

  async connectedCallback() {
    await use(this.translationsLang);
    this.hasLoadedStrings = true;
    super.connectedCallback();
  }

  static get styles(){
    return [
      Bulma
    ]
  }

  @property({type: String})
  errorMessage = "";

  @property({type: Boolean})
  signingUp = false;

  validate = (json: any) => {
    var pw = json.password as string;
    var pwc = json.password_confirm as string;
    if (pw !== pwc) return { error: true, message: get('password_match_error')};
    return {error:false, message:""};
  }

  handleSubmit = (e: any) => {
    e.preventDefault();
    const form = this.shadowRoot?.querySelector('form')!;
    const formData = new FormData(form);
    const formJson = Object.fromEntries(formData);
    
    //client side form validation
    var validation = this.validate(formJson);
    console.log(formJson);
    console.log(validation);
    if (validation.error) {
      this.errorMessage = validation.message;
      return;
    }
    
    this.signingUp = true;

    fetch(this.postUrl,{
        method: 'post',
        body: JSON.stringify(formJson)
    })
    .then(res => {
      this.signingUp = false;
      if (res.ok) {
        this.clearMessage();
        return res;
      }
      if (res.status == 400) {
        this.errorMessage = get('bad_request');
        return res;
      }
      this.errorMessage = get('unknown_error');
      return res;
    })
    
  }

  clearMessage = () => {
    this.errorMessage = "";
  }

  render() {
    return html`

    <form class="control is-family-primary is-fullwidth login-form" @submit="${this.handleSubmit}">
        <div class = "field">
          <p class = "control">
            <label class = "label">${get('firstname_label')}</label>
            <input id = "email_input" class = "input is-fullwidth" type="text" name="first_name"></input>
          </p>
        </div>
        <div class = "field">
          <p class = "control">
            <label class = "label">${get('lastname_label')}</label>
            <input id = "email_input" class = "input is-fullwidth" type="text" name="last_name"></input>
          </p>
        </div>
        <div class = "field">
          <p class = "control">
            <label class = "label">${get('email_label')}</label>
            <input id = "email_input" class = "input is-fullwidth" type="email" name="email"></input>
          </p>
        </div>
        <div class = "field">
          <p class = "control">
            <label class = "label">${get('password_label')}</label>
            <input class = "input is-fullwidth" type="password" name="password"></input>
          </p>
        </div>
        <div class = "field">
          <p class = "control">
            <label class = "label">${get('password_confirm_label')}</label>
            <input class = "input is-fullwidth" type="password" name="password_confirm"></input>
          </p>
        </div>
        <div class = "tile">
          <p class = "control">
            <button class = "input button is-success is-fullwidth" type="submit">${this.signingUp ? get('button_loading_label') : get('button_label')}</button>
          </p>
        </div>
    </form>
    ${
      this.errorMessage.length > 0 
        ? html`
            <div class="is-family-primary notification is-danger mt-4">
              <a class="delete" @click=${this.clearMessage}></a>
              ${this.errorMessage}
            </div>` 
        : ''
    }
    `;
  }
}
