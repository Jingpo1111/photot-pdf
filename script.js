
const fileInput = document.getElementById("fileInput");
const dropZone = document.getElementById("dropZone");
const photoGrid = document.getElementById("photoGrid");
const photoCount = document.getElementById("photoCount");
const emptyState = document.getElementById("emptyState");

const clearAll = document.getElementById("clearAll");
const generatePDF = document.getElementById("generatePDF");

const pageSize = document.getElementById("pageSize");
const orientation = document.getElementById("orientation");
const margin = document.getElementById("margin");

let photos = [];


/* =========================
   FILE UPLOAD
========================= */

fileInput.addEventListener("change", function () {

    addFiles(this.files);

    this.value = "";

});


/* =========================
   DRAG & DROP
========================= */

dropZone.addEventListener("dragover", function (e) {

    e.preventDefault();

    dropZone.classList.add("dragover");

});


dropZone.addEventListener("dragleave", function () {

    dropZone.classList.remove("dragover");

});


dropZone.addEventListener("drop", function (e) {

    e.preventDefault();

    dropZone.classList.remove("dragover");

    addFiles(e.dataTransfer.files);

});


/* =========================
   ADD FILES
========================= */

function addFiles(files) {

    Array.from(files).forEach(file => {

        if (!file.type.startsWith("image/")) {
            return;
        }

        const reader = new FileReader();

        reader.onload = function (e) {

            photos.push({
                src: e.target.result,
                rotation: 0,
                name: file.name
            });

            renderPhotos();

        };

        reader.readAsDataURL(file);

    });

}


/* =========================
   RENDER PHOTOS
========================= */

function renderPhotos() {

    photoGrid.innerHTML = "";

    photoCount.textContent = photos.length;

    if (photos.length === 0) {

        photoGrid.appendChild(emptyState);

        generatePDF.disabled = true;

        return;

    }

    generatePDF.disabled = false;


    photos.forEach((photo, index) => {

        const card = document.createElement("div");

        card.className = "photo-card";


        const number = document.createElement("div");

        number.className = "photo-number";

        number.textContent = index + 1;


        const img = document.createElement("img");

        img.src = photo.src;

        img.style.transform =
            `rotate(${ photo.rotation }deg)`;


        const actions = document.createElement("div");

        actions.className = "photo-actions";


        const leftButton = document.createElement("button");

        leftButton.textContent = "←";

        leftButton.title = "Move left";

        leftButton.onclick = () =>
            movePhoto(index, -1);


        const rotateButton = document.createElement("button");

        rotateButton.textContent = "↻";

        rotateButton.title = "Rotate";

        rotateButton.onclick = () =>
            rotatePhoto(index);


        const rightButton = document.createElement("button");

        rightButton.textContent = "→";

        rightButton.title = "Move right";

        rightButton.onclick = () =>
            movePhoto(index, 1);


        const deleteButton = document.createElement("button");

        deleteButton.textContent = "🗑";

        deleteButton.className = "delete";

        deleteButton.title = "Delete";

        deleteButton.onclick = () =>
            deletePhoto(index);


        actions.appendChild(leftButton);

        actions.appendChild(rotateButton);

        actions.appendChild(rightButton);

        actions.appendChild(deleteButton);


        card.appendChild(number);

        card.appendChild(img);

        card.appendChild(actions);


        photoGrid.appendChild(card);

    });

}


/* =========================
   ROTATE
========================= */

function rotatePhoto(index) {

    photos[index].rotation += 90;

    if (photos[index].rotation >= 360) {
        photos[index].rotation = 0;
    }

    renderPhotos();

}


/* =========================
   DELETE
========================= */

function deletePhoto(index) {

    photos.splice(index, 1);

    renderPhotos();

}


/* =========================
   MOVE PHOTO
========================= */

function movePhoto(index, direction) {

    const newIndex = index + direction;

    if (
        newIndex < 0 ||
        newIndex >= photos.length
    ) {
        return;
    }

    const temp = photos[index];

    photos[index] = photos[newIndex];

    photos[newIndex] = temp;

    renderPhotos();

}


/* =========================
   CLEAR ALL
========================= */

clearAll.addEventListener("click", function () {

    if (photos.length === 0) {
        return;
    }

    photos = [];

    renderPhotos();

});


/* =========================
   GENERATE PDF
========================= */

generatePDF.addEventListener("click", async function () {

    if (photos.length === 0) {
        return;
    }


    generatePDF.disabled = true;

    generatePDF.innerHTML =
        "⏳ Creating PDF...";


    try {

        const { jsPDF } = window.jspdf;


        let format = "a4";

        if (pageSize.value === "letter") {
            format = "letter";
        }


        let pdf;


        if (pageSize.value === "original") {

            const firstImage =
                await loadImage(photos[0].src);

            const width =
                firstImage.naturalWidth * 0.264583;

            const height =
                firstImage.naturalHeight * 0.264583;

            pdf = new jsPDF({
                orientation:
                    width > height
                        ? "landscape"
                        : "portrait",

                unit: "mm",

                format: [
                    width,
                    height
                ]
            });

        } else {

            pdf = new jsPDF({
                orientation:
                    orientation.value,

                unit: "mm",

                format: format
            });

        }


        for (let i = 0; i < photos.length; i++) {

            if (i > 0) {

                if (pageSize.value === "original") {

                    const img =
                        await loadImage(
                            photos[i].src
                        );

                    const width =
                        img.naturalWidth * 0.264583;

                    const height =
                        img.naturalHeight * 0.264583;

                    pdf.addPage(
                        [width, height],
                        width > height
                            ? "landscape"
                            : "portrait"
                    );

                } else {

                    pdf.addPage();

                }

            }


            const img =
                await loadImage(
                    photos[i].src
                );


            let pageWidth =
                pdf.internal.pageSize.getWidth();

            let pageHeight =
                pdf.internal.pageSize.getHeight();


            const marginValue =
                Number(margin.value);


            const availableWidth =
                pageWidth -
                marginValue * 2;

            const availableHeight =
                pageHeight -
                marginValue * 2;


            const imageRatio =
                img.naturalWidth /
                img.naturalHeight;


            const pageRatio =
                availableWidth /
                availableHeight;


            let imageWidth;
            let imageHeight;


            if (imageRatio > pageRatio) {

                imageWidth =
                    availableWidth;

                imageHeight =
                    imageWidth /
                    imageRatio;

            } else {

                imageHeight =
                    availableHeight;

                imageWidth =
                    imageHeight *
                    imageRatio;

            }


            const x =
                (pageWidth - imageWidth) / 2;

            const y =
                (pageHeight - imageHeight) / 2;


            pdf.addImage(
                photos[i].src,
                "JPEG",
                x,
                y,
                imageWidth,
                imageHeight,
                undefined,
                "FAST",
                photos[i].rotation
            );

        }


        pdf.save(
            "photos-to-pdf.pdf"
        );


    } catch (error) {

        console.error(error);

        alert(
            "Something went wrong while creating the PDF."
        );

    }


    generatePDF.disabled = false;

    generatePDF.innerHTML =
        "📄 Generate PDF";

});


/* =========================
   LOAD IMAGE
========================= */

function loadImage(src) {

    return new Promise((resolve, reject) => {

        const img = new Image();

        img.onload = () =>
            resolve(img);

        img.onerror = reject;

        img.src = src;

    });

}


/* Initial state */

renderPhotos();

