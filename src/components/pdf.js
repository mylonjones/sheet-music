
import * as pdfjsLib from "pdfjs-dist/build/pdf";
import * as pdfjsWorker from "pdfjs-dist/build/pdf.worker.entry";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export function loadPdf(url, setPdfRef) {
  const loadingTask = pdfjsLib.getDocument(url);
  loadingTask.promise.then(loadedPdf => {
    setPdfRef(loadedPdf);
  }, function (reason) {
    console.error(reason);
  });
}

export function renderPdf(pageNum, pdf, canvas, canvas2, img, ctx2, fileName) {
  pdf && pdf.getPage(pageNum).then(function(page) {
    let viewport = page.getViewport({scale: 1});
    //pdf width
    const ratio = (window.innerWidth)/viewport.width
    viewport = page.getViewport({scale: ratio})

    const renderContext = { canvasContext: ctx2, viewport };
    if(ctx2) {
      page.render(renderContext)
      const savedCanvas = localStorage.getItem( fileName + pageNum)
      if(savedCanvas) img.src = savedCanvas

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      canvas2.height = viewport.height;
      canvas2.width = viewport.width;
    }


  });
}