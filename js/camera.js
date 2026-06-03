import { S } from './state.js';
import { showNotif } from './ui.js';

/* ══════════════════════════════════════════════════════
   CAMERA — shared by Body Scan and Skin Care tabs
══════════════════════════════════════════════════════ */

/* Read a dropped/selected image file into base64 */
export function readFile(file, target) {
  if(!file) return;
  const reader=new FileReader();
  reader.onload=ev=>{
    const src=ev.target.result;
    const b64=src.split(',')[1];
    if(target==='body'){
      S.bodyB64=b64;
      document.getElementById('body-prev').src=src;
      document.getElementById('body-prev').style.display='block';
      document.getElementById('body-anlz').style.display='block';
    } else {
      S.skinB64=b64;
      document.getElementById('skin-prev').src=src;
      document.getElementById('skin-prev').style.display='block';
      document.getElementById('skin-anlz').style.display='block';
    }
  };
  reader.readAsDataURL(file);
}

/* Open device camera (environment-facing for body, user-facing for skin) */
export async function openCam(target) {
  try {
    const facingMode=target==='body'?'environment':'user';
    const stream=await navigator.mediaDevices.getUserMedia({video:{facingMode}});
    if(target==='body'){
      S.bodyStream=stream;
      const v=document.getElementById('body-vid');
      v.srcObject=stream; v.style.display='block';
      document.getElementById('body-cam').style.display='none';
      document.getElementById('body-cap').style.display='inline-block';
      document.getElementById('body-cls').style.display='inline-block';
    } else {
      S.skinStream=stream;
      const v=document.getElementById('skin-vid');
      v.srcObject=stream; v.style.display='block';
      document.getElementById('skin-cam').style.display='none';
      document.getElementById('skin-cap').style.display='inline-block';
      document.getElementById('skin-cls').style.display='inline-block';
    }
  } catch(e){ showNotif('Camera access denied','Camera Error'); }
}

/* Capture current video frame as JPEG base64 */
export function capCam(target) {
  const vid=document.getElementById(target+'-vid');
  const canvas=document.createElement('canvas');
  canvas.width=vid.videoWidth; canvas.height=vid.videoHeight;
  canvas.getContext('2d').drawImage(vid,0,0);
  const src=canvas.toDataURL('image/jpeg',.85);
  const b64=src.split(',')[1];
  if(target==='body'){
    S.bodyB64=b64;
    document.getElementById('body-prev').src=src;
    document.getElementById('body-prev').style.display='block';
    document.getElementById('body-anlz').style.display='block';
  } else {
    S.skinB64=b64;
    document.getElementById('skin-prev').src=src;
    document.getElementById('skin-prev').style.display='block';
    document.getElementById('skin-anlz').style.display='block';
  }
  closeCam(target);
}

/* Stop the media stream and reset UI */
export function closeCam(target) {
  if(target==='body'&&S.bodyStream){
    S.bodyStream.getTracks().forEach(t=>t.stop()); S.bodyStream=null;
    document.getElementById('body-vid').style.display='none';
    document.getElementById('body-cam').style.display='inline-block';
    document.getElementById('body-cap').style.display='none';
    document.getElementById('body-cls').style.display='none';
  } else if(target==='skin'&&S.skinStream){
    S.skinStream.getTracks().forEach(t=>t.stop()); S.skinStream=null;
    document.getElementById('skin-vid').style.display='none';
    document.getElementById('skin-cam').style.display='inline-block';
    document.getElementById('skin-cap').style.display='none';
    document.getElementById('skin-cls').style.display='none';
  }
}

/* Expose to window for inline HTML handlers */
window.readFile = readFile;
window.openCam = openCam;
window.capCam = capCam;
window.closeCam = closeCam;
