import got from 'got';
import * as FormData from 'form-data';
import { Inject, Injectable } from '@nestjs/common';
import { CONFIG_OPTIONS } from '../common/common.constants';
import { EmailVar, MailModuleOptions } from './mail.interfaces';


@Injectable()
export class MailService {
    constructor(
        @Inject(CONFIG_OPTIONS) private readonly options: MailModuleOptions
        ) {}
    
    private async sendEmail(subject: string, template: string, emailVars: EmailVar[]) {
        const form = new FormData();
        form.append("from", `Excited User <mailgun@${this.options.domain}>`);
        form.append("to", `authorizedemail`);
        form.append("subject", subject);
        form.append("template", template);
        emailVars.forEach(eVar => form.append(`v:${eVar.key}`, eVar.value))
        try {
            await got(`https://api.mailgun.net/v3/${this.options.domain}/messages/`, {
            method: "POST",
            headers: {
                Authorization: `Basic ${Buffer.from(`api:${this.options.apiKey}`).toString("base64")}`
            },
            body: form
            });
        } catch(error) {
        }
    }

    sendVerificationEmail(email: string, code: string) {
        this.sendEmail('Подтвердите адрес эл. почты', 'verify-email', [
            { "key": "code", "value": code },
            { "key": "email", "value": email }
        ])
    }
}