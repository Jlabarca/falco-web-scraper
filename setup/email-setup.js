
const nodemailer = require('nodemailer')
const log = require("./log-setup");
const db = require("./db-setup");

const configuration = db.collection("configuration");

var transporter;

initEmailConfiguration();

async function initEmailConfiguration() {
    let all = await configuration.find({});
    let falcoConfiguration = all[0];
    console.log("===================================================");
    console.log("Email Configuration:");
    console.log("===================================================");
    console.log("       "+falcoConfiguration.email_address);
    //console.log("       "+falcoConfiguration.email_password);
    console.log("===================================================");

    transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: falcoConfiguration.email_address,
            pass: falcoConfiguration.email_password
        }
    })
}

/**
 * Email Builder
 */
const head = "<!DOCTYPE html PUBLIC '-//W3C//DTD XHTML 1.0 Transitional//EN' 'http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd'><html xmlns='http://www.w3.org/1999/xhtml'><head><title>Falco - Nuevo aviso detectado</title><meta http-equiv='Content-Type' content='text/html; charset=utf-8' /><meta name='viewport' content='width=device-width, initial-scale=1.0' /><style type='text/css'>* {-ms-text-size-adjust:100%;-webkit-text-size-adjust:none;-webkit-text-resize:100%;text-resize:100%;}a{outline:none;color:#40aceb;text-decoration:underline;}a:hover{text-decoration:none !important;}.nav a:hover{text-decoration:underline !important;}.title a:hover{text-decoration:underline !important;}.title-2 a:hover{text-decoration:underline !important;}.btn:hover{opacity:0.8;}.btn a:hover{text-decoration:none !important;}.btn{-webkit-transition:all 0.3s ease;-moz-transition:all 0.3s ease;-ms-transition:all 0.3s ease;transition:all 0.3s ease;}table td {border-collapse: collapse !important;}.ExternalClass, .ExternalClass a, .ExternalClass span, .ExternalClass b, .ExternalClass br, .ExternalClass p, .ExternalClass div{line-height:inherit;}@media only screen and (max-width:500px) {table[class='flexible']{width:100% !important;}table[class='center']{float:none !important;margin:0 auto !important;}*[class='hide']{display:none !important;width:0 !important;height:0 !important;padding:0 !important;font-size:0 !important;line-height:0 !important;}td[class='img-flex'] img{width:100% !important;height:auto !important;}td[class='aligncenter']{text-align:center !important;}th[class='flex']{display:block !important;width:100% !important;}td[class='wrapper']{padding:0 !important;}td[class='holder']{padding:30px 15px 20px !important;}td[class='nav']{padding:20px 0 0 !important;text-align:center !important;}td[class='h-auto']{height:auto !important;}td[class='description']{padding:30px 20px !important;}td[class='i-120'] img{width:120px !important;height:auto !important;}td[class='footer']{padding:5px 20px 20px !important;}td[class='footer'] td[class='aligncenter']{line-height:25px !important;padding:20px 0 0 !important;}tr[class='table-holder']{display:table !important;width:100% !important;}th[class='thead']{display:table-header-group !important; width:100% !important;}th[class='tfoot']{display:table-footer-group !important; width:100% !important;}}</style></head>"

const bodyInit = "<body style='margin:0; padding:0;' bgcolor='#eaeced'><table style='min-width:320px;' width='100%' cellspacing='0' cellpadding='0' bgcolor='#eaeced'><!-- fix for gmail --><tr><td class='hide'><table width='600' cellpadding='0' cellspacing='0' style='width:600px !important;'><tr><td style='min-width:600px; font-size:0; line-height:0;'>&nbsp;</td></tr></table></td></tr><tr><td class='wrapper' style='padding:0 10px;'><!-- module 1 --><table data-module='module-1' data-thumb='thumbnails/01.png' width='100%' cellpadding='0' cellspacing='0'><tr><td data-bgcolor='bg-module' bgcolor='#eaeced'><table class='flexible' width='600' align='center' style='margin:0 auto;' cellpadding='0' cellspacing='0'><tr><td style='padding:29px 0 30px;'></td></tr></table></td></tr></table><!-- module 2 --><table data-module='module-2' data-thumb='thumbnails/02.png' width='100%' cellpadding='0' cellspacing='0'><tr><td data-bgcolor='bg-module' bgcolor='#eaeced'><table class='flexible' width='600' align='center' style='margin:0 auto;' cellpadding='0' cellspacing='0'><tr><td class='img-flex'><img  style='vertical-align:top;' width='120' height='64' alt='' /></td></tr><tr><td data-bgcolor='bg-block' class='holder' style='padding:30px 20px 0px;' bgcolor='#ffffff'><table width='100%' cellpadding='0' cellspacing='0'><tr><td data-color='text' data-size='size text' data-min='10' data-max='26' data-link-color='link text color' data-link-style='font-weight:bold; text-decoration:underline; color:#40aceb;' align='center' style='font:bold 16px/25px Arial, Helvetica, sans-serif; color:#888; padding:0 0 23px;'>"

const titleInit = "</td></tr><tr><td data-color='title' data-size='size title' data-min='25' data-max='45' data-link-color='link title color' data-link-style='text-decoration:none; color:#292c34;' class='title' align='center' style='font-family: sans-serif; font-weight: bold; font-size: xx-large; text-transform: capitalize; color:#5623FF; padding:0 0 24px;'>"

const titleEnd = "</td></tr></table></td></tr><tr><td height='28'></td></tr></table></td></tr></table>"

const cardInit = "<table data-module='module-3' data-thumb='thumbnails/03.png' width='100%' cellpadding='0' cellspacing='0'><tr><td data-bgcolor='bg-module' bgcolor='#eaeced'><table class='flexible' width='600' align='center' style='margin:0 auto;' cellpadding='0' cellspacing='0'><tr><td data-bgcolor='bg-block' class='holder' style='padding:38px 60px 15px;' bgcolor='#ffffff'><table width='100%' cellpadding='0' cellspacing='0'><tr><td style='text-align: center'><img src='"

const cardTitle = "' style='padding-bottom: 15px' width='120' height='120' alt='' align='center'/></td></tr><tr><td data-color='title' data-size='size title' data-min='20' data-max='40' data-link-color='link title color' data-link-style='text-decoration:none; color:#292c34;' class='title' align='center' style='font:30px/33px Arial, Helvetica, sans-serif; color:#292c34; padding:0 0 24px;'>"
const cardPrice = "</td></tr><tr><td data-color='text' data-size='size text' data-min='10' data-max='26' data-link-color='link text color' data-link-style='font-weight:bold; text-decoration:underline; color:#40aceb;' align='center' style='font:30px/29px Arial, Helvetica, sans-serif; color:#888; padding:0 0 21px;'>"

const cardUrl = "</td></tr><tr><td style='padding:0 0 20px;'><table width='134' align='center' style='margin:0 auto;' cellpadding='0' cellspacing='0'><tr><td data-bgcolor='bg-button' data-size='size button' data-min='10' data-max='16' class='btn' align='center' style='font:12px/14px Arial, Helvetica, sans-serif; color:#f8f9fb; text-transform:uppercase; mso-padding-alt:12px 10px 10px; border-radius:2px;' bgcolor='#5623FF'><a target='_blank' style='text-decoration:none; color:#ffffff; display:block; padding:12px 10px 10px;' href='"
const cardEnd = "'>Ver</a></td></tr></table></td></tr></table></td></tr><tr><td height='28'></td></tr></table></td></tr></table>"

const bodyEnd = "<table data-module='module-6' data-thumb='thumbnails/06.png' width='100%' cellpadding='0' cellspacing='0'><tr><td data-bgcolor='bg-module' bgcolor='#eaeced'><table class='flexible' width='600' align='center' style='margin:0 auto;' cellpadding='0' cellspacing='0'><tr><td data-bgcolor='bg-block' class='holder' style='padding:64px 60px 50px;' bgcolor='#ffffff'><table width='100%' cellpadding='0' cellspacing='0'><tr><td data-color='title' data-size='size title' data-min='20' data-max='40' data-link-color='link title color' data-link-style='text-decoration:none; color:#292c34;' class='title' align='center' style='font:30px/33px Arial, Helvetica, sans-serif; color:#292c34; padding:0 0 23px;'>Información útil?</td></tr><tr><td data-color='text' data-size='size text' data-min='10' data-max='26' data-link-color='link text color' data-link-style='font-weight:bold; text-decoration:underline; color:#40aceb;' align='center' style='font:16px/29px Arial, Helvetica, sans-serif; color:#888; padding:0 0 21px;'>Si te ha servido nuestro aviso, apoyanos compartiendolo en redes sociales (mentira el boton no hace nada)</td></tr><tr><td style='padding:0 0 20px;'><table width='232' align='center' style='margin:0 auto;' cellpadding='0' cellspacing='0'><tr><td data-bgcolor='bg-button' data-size='size button' data-min='10' data-max='20' class='btn' align='center' style='font:bold 16px/18px Arial, Helvetica, sans-serif; color:#ffffff; text-transform:uppercase; mso-padding-alt:22px 10px; border-radius:3px;' bgcolor='#e02d74'><a target='_blank' style='text-decoration:none; color:#ffffff; display:block; padding:22px 10px;' href='#'>Compartir</a></td></tr></table></td></tr></table></td></tr><tr><td height='28'></td></tr></table></td></tr></table><!-- module 7 --><table data-module='module-7' data-thumb='thumbnails/07.png' width='100%' cellpadding='0' cellspacing='0'><tr><td data-bgcolor='bg-module' bgcolor='#eaeced'><table class='flexible' width='600' align='center' style='margin:0 auto;' cellpadding='0' cellspacing='0'><tr><td class='footer' style='padding:0 0 10px;'><table width='100%' cellpadding='0' cellspacing='0'><tr class='table-holder'><th class='tfoot' width='400' align='left' style='vertical-align:top; padding:0;'><table width='100%' cellpadding='0' cellspacing='0'><tr><td data-color='text' data-link-color='link text color' data-link-style='text-decoration:underline; color:#797c82;' class='aligncenter' style='font:12px/16px Arial, Helvetica, sans-serif; color:#797c82; padding:0 0 10px;'>JLabarca, 2017. &nbsp; All Rights Reserved. <a target='_blank' style='text-decoration:underline; color:#797c82;' href='sr_unsubscribe'>Unsubscribe.</a></td></tr></table></th><th class='thead' width='200' align='left' style='vertical-align:top; padding:0;'><table class='center' align='right' cellpadding='0' cellspacing='0'><tr><td class='btn' valign='top' style='line-height:0; padding:3px 0 0;'><a target='_blank' style='text-decoration:none;' href='#'><img src='images/ico-facebook.png' border='0' style='font:12px/15px Arial, Helvetica, sans-serif; color:#797c82;' align='left' vspace='0' hspace='0' width='6' height='13' alt='fb' /></a></td><td width='20'></td><td class='btn' valign='top' style='line-height:0; padding:3px 0 0;'><a target='_blank' style='text-decoration:none;' href='#'><img src='images/ico-twitter.png' border='0' style='font:12px/15px Arial, Helvetica, sans-serif; color:#797c82;' align='left' vspace='0' hspace='0' width='13' height='11' alt='tw' /></a></td><td width='19'></td><td class='btn' valign='top' style='line-height:0; padding:3px 0 0;'><a target='_blank' style='text-decoration:none;' href='#'><img src='images/ico-google-plus.png' border='0' style='font:12px/15px Arial, Helvetica, sans-serif; color:#797c82;' align='left' vspace='0' hspace='0' width='19' height='15' alt='g+' /></a></td><td width='20'></td><td class='btn' valign='top' style='line-height:0; padding:3px 0 0;'><a target='_blank' style='text-decoration:none;' href='#'><img src='images/ico-linkedin.png' border='0' style='font:12px/15px Arial, Helvetica, sans-serif; color:#797c82;' align='left' vspace='0' hspace='0' width='13' height='11' alt='in' /></a></td></tr></table></th></tr></table></td></tr></table></td></tr></table></td></tr><!-- fix for gmail --><tr><td style='line-height:0;'><div style='display:none; white-space:nowrap; font:15px/1px courier;'>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;</div></td></tr></table></body></html>"



module.exports = {
    buildEmail: function(snapshot) {
        let initMsg = "Falco ha detectado una nueva publicación para:"
        if(snapshot.length > 1)
            initMsg = "Falco ha detectado nuevas publicaciones para:"

        return head + bodyInit + initMsg + titleInit + snapshot.name 
        
        +"<a target='_blank' style='text-decoration:none; color:#ffffff; display:block; padding:12px 10px 10px;' href='" + snapshot.url +"'</a>"
        + titleEnd + this.buildCards(snapshot) + bodyEnd
    },
    buildCards: function(snapshot) {
        var cards = ""
        // not sure if mutating snapshot affects insert to db or something else
    
        snapshot.diffData.forEach(detection => {
            detection.img_url = "https://via.placeholder.com/140x100"
            if(detection.price == null) detection.price = "";
            if(detection.image == null) detection.image = "https://via.placeholder.com/140x100";
            if(detection.link == null) detection.link = snapshot.url;
            cards += cardInit + detection.image + cardTitle + detection.title + cardPrice + this.formatPrice(detection.price) + cardUrl + detection.link + cardEnd            
        });
        return cards
    },
    formatPrice (num) {
        return num.toLocaleString()
    },
    sendEmail (user, snapshot) {
        
            return new Promise((resolve, reject) => {
                
                let body = user.name + ', acabo de ver que '
                let nuevo = 'Nuevos articulos con título '
                if (snapshot.data.length == 1) {
                    nuevo = 'Nuevo articulo con título '
                    body += 'publicaron el siguiente aviso de '
                } else
                    body += 'publicaron los siguientes avisos de '
        
                body += snapshot.name + ': <br><br>'
        
                let messageList = ''
        
                let mailOptions = {
                    from: '"Falco 🦅" <bot@falco.cl>', // sender address
                    to: user.email, // list of receivers
                    subject: nuevo + snapshot.name + ' en Yapo', // Subject line
                    text: body + messageList, // plain text body
                    html: this.buildEmail(snapshot) // html body
                }
                
                resolve()

                // send mail with defined transport object
                transporter.sendMail(mailOptions, (error, info) => {
                    if(info != null){
                        log.info('Email sent with %s of %s to %s', snapshot.data.length, snapshot.name, user.email)
                        log.debug('Message %s sent: %s', info.messageId, info.response)                
                    }else 
                        log.warn('Email could not be sent')
                    
                    if (error)
                        log.error(error)
                    resolve()
                })
            }).catch((error, info) => {
                log.error(info)
                reject()
            })
        
        }

}