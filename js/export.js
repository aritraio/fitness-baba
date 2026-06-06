import { showNotif } from './ui.js';

export async function exportElementAsPDF(elementId, filename) {
  const el = document.getElementById(elementId);
  if (!el || !el.innerHTML.trim() || el.querySelector('.loader') || el.querySelector('.err-card')) {
    showNotif('No valid plan generated to export yet.', 'Export Error');
    return;
  }
  showNotif('Preparing PDF export...', 'Export');
  try {
    const { jsPDF } = window.jspdf;
    
    const canvas = await window.html2canvas(el, {
      backgroundColor: document.documentElement.getAttribute('data-theme') === 'light' ? '#ffffff' : '#080c0f',
      scale: 2,
      useCORS: true,
      logging: false
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 190; // margins
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 10; // top margin

    pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight + 10;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    pdf.save(filename);
    showNotif('Plan downloaded successfully! 📄', 'Success');
  } catch (err) {
    console.error(err);
    showNotif('Failed to generate PDF: ' + err.message, 'Export Error');
  }
}

export async function exportElementAsImage(elementId, filename) {
  const el = document.getElementById(elementId);
  if (!el) {
    showNotif('Target element not found.', 'Export Error');
    return;
  }
  showNotif('Generating image...', 'Export');
  try {
    const canvas = await window.html2canvas(el, {
      backgroundColor: document.documentElement.getAttribute('data-theme') === 'light' ? '#ffffff' : '#0e1418',
      scale: 2,
      useCORS: true,
      logging: false
    });
    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL('image/png');
    link.click();
    showNotif('Progress card downloaded! 🖼️', 'Success');
  } catch (err) {
    console.error(err);
    showNotif('Failed to export image: ' + err.message, 'Export Error');
  }
}

window.exportMealPlan = () => exportElementAsPDF('meals-out', 'Meals-Plan.pdf');
window.exportWorkoutPlan = () => exportElementAsPDF('workout-out', 'Workout-Plan.pdf');
window.exportProgressTrend = () => exportElementAsImage('progress-trend-card', 'Weight-Trend.png');
