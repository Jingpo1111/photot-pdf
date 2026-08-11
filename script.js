
const fileInput =
    document.getElementById("fileInput");

const dropZone =
    document.getElementById("dropZone");

const photoGrid =
    document.getElementById("photoGrid");

const photoCount =
    document.getElementById("photoCount");

const emptyState =
    document.getElementById("emptyState");

const clearAll =
    document.getElementById("clearAll");

const generatePDF =
    document.getElementById("generatePDF");

const savePDF =
    document.getElementById("savePDF");

const pageSize =
    document.getElementById("pageSize");

const orientation =
    document.getElementById("orientation");

const margin =
    document.getElementById("margin");

const fileName =
    document.getElementById("fileName");


let photos = [];

let generatedPDF = null;


/* =========================
   FILE UPLOAD
========================= */

fileInput.addEventListener(
    "change",
    function () {

        addFiles(this.files);

        this.value = "";

    }
);


/* =========================
   DRAG & DROP
========================= */

dropZone.addEventListener(
    "dragover",
    function (e) {

        e.preventDefault();

        dropZone.classList.add(
            "dragover"
        );

    }
);


dropZone.addEventListener(
    "dragleave",
    function () {

        dropZone.classList.remove(
            "dragover"
        );

    }
);


dropZone.addEventListener(
    "drop",
    function (e) {

        e.preventDefault();

        dropZone.classList.remove(
            "dragover"
        );

        addFiles(
            e.dataTransfer.files
        );

    }
);


/* =========================
   ADD FILES
========================= */

function addFiles(files) {

    Array.from(files).forEach(
        file => {

            if (
                !file.type.startsWith(
                    "image/"
                )
            ) {
                return;
            }


            const reader =
                new FileReader();


            reader.onload =
                function (e) {

                    photos.push({

                        src: e.target.result,

                        rotation: 0,

                        name: file.name

                    });


                    renderPhotos();

                };


            reader.readAsDataURL(file);

        }
    );

}


/* =========================
   RENDER PHOTOS
========================= */

function renderPhotos() {

    photoGrid.innerHTML = "";

    photoCount.textContent =
        photos.length;


    if (photos.length === 0) {

        photoGrid.appendChild(
            emptyState
        );

        generatePDF.disabled =
            true;

        savePDF.disabled =
            true;

        generatedPDF = null;

        return;

    }


    generatePDF.disabled =
        false;


    photos.forEach(
        (photo, index) => {

            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "photo-card";


            const number =
                document.createElement(
                    "div"
                );

            number.className =
                "photo-number";

            number.textContent =
                index + 1;


            const img =
                document.createElement(
                    "img"
                );

            img.src =
                photo.src;

            img.style.transform =
                `rotate(${photo.rotation}deg)`;


            const actions =
                document.createElement(
                    "div"
                );

            actions.className =
                "photo-actions";


            /* MOVE LEFT */

            const leftButton =
                document.createElement(
                    "button"
                );

            leftButton.textContent =
                "←";

            leftButton.title =
                "Move left";

            leftButton.onclick =
                () => movePhoto(
                    index,
                    -1
                );


            /* ROTATE */

            const rotateButton =
                document.createElement(
                    "button"
                );

            rotateButton.textContent =
                "↻";

            rotateButton.title =
                "Rotate";

            rotateButton.onclick =
                () => rotatePhoto(
                    index
                );


            /* MOVE RIGHT */

            const rightButton =
                document.createElement(
                    "button"
                );

            rightButton.textContent =
                "→";

            rightButton.title =
                "Move right";

            rightButton.onclick =
                () => movePhoto(
                    index,
                    1
                );


            /* DELETE */

            const deleteButton =
                document.createElement(
                    "button"
                );

            deleteButton.textContent =
                "🗑";

            deleteButton.className =
                "delete";

            deleteButton.title =
                "Delete";

            deleteButton.onclick =
                () => deletePhoto(
                    index
                );


            actions.appendChild(
                leftButton
            );

            actions.appendChild(
                rotateButton
            );

            actions.appendChild(
                rightButton
            );

            actions.appendChild(
                deleteButton
            );


            card.appendChild(
                number
            );

            card.appendChild(
                img
            );

            card.appendChild(
                actions
            );


            photoGrid.appendChild(
                card
            );

        }
    );

}


/* =========================
   ROTATE
========================= */

function rotatePhoto(index) {

    photos[index].rotation +=
        90;


    if (
        photos[index].rotation >=
        360
    ) {

        photos[index].rotation =
            0;

    }


    renderPhotos();

}


/* =========================
   DELETE
========================= */

function deletePhoto(index) {

    photos.splice(
        index,
        1
    );

    generatedPDF = null;

    savePDF.disabled =
        true;

    renderPhotos();

}


/* =========================
   MOVE PHOTO
========================= */

function movePhoto(
    index,
    direction
) {

    const newIndex =
        index + direction;


    if (
        newIndex < 0 ||
        newIndex >= photos.length
    ) {

        return;

    }


    const temp =
        photos[index];


    photos[index] =
        photos[newIndex];


    photos[newIndex] =
        temp;


    generatedPDF = null;

    savePDF.disabled =
        true;


    renderPhotos();

}


/* =========================
   CLEAR ALL
========================= */

clearAll.addEventListener(
    "click",
    function () {

        if (
            photos.length === 0
        ) {

            return;

        }


        photos = [];

        generatedPDF = null;

        savePDF.disabled =
            true;


        renderPhotos();

    }
);


/* =========================
   GENERATE PDF
========================= */

generatePDF.addEventListener(
    "click",
    async function () {

        if (
            photos.length === 0
        ) {

            return;

        }


        generatePDF.disabled =
            true;


        generatePDF.innerHTML =
            "⏳ Creating PDF...";


        try {

            const {
                jsPDF
            } = window.jspdf;


            let format =
                "a4";


            if (
                pageSize.value ===
                "letter"
            ) {

                format =
                    "letter";

            }


            let pdf;


            /* ORIGINAL SIZE */

            if (
                pageSize.value ===
                "original"
            ) {

                const firstImage =
                    await loadImage(
                        photos[0].src
                    );


                const width =
                    firstImage.naturalWidth *
                    0.264583;


                const height =
                    firstImage.naturalHeight *
                    0.264583;


                pdf = new jsPDF({

                    orientation:
                        width > height
                            ? "landscape"
                            : "portrait",

                    unit:
                        "mm",

                    format: [
                        width,
                        height
                    ]

                });


            } else {

                pdf = new jsPDF({

                    orientation:
                        orientation.value,

                    unit:
                        "mm",

                    format:
                        format

                });

            }


            /* ADD EACH PHOTO */

            for (
                let i = 0;
                i < photos.length;
                i++
            ) {

                if (i > 0) {

                    if (
                        pageSize.value ===
                        "original"
                    ) {

                        const img =
                            await loadImage(
                                photos[i].src
                            );


                        const width =
                            img.naturalWidth *
                            0.264583;


                        const height =
                            img.naturalHeight *
                            0.264583;


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


                const pageWidth =
                    pdf.internal.pageSize
                        .getWidth();


                const pageHeight =
                    pdf.internal.pageSize
                        .getHeight();


                const marginValue =
                    Number(
                        margin.value
                    );


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


                if (
                    imageRatio >
                    pageRatio
                ) {

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
                    (
                        pageWidth -
                        imageWidth
                    ) / 2;


                const y =
                    (
                        pageHeight -
                        imageHeight
                    ) / 2;


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


            /* SAVE PDF OBJECT */

            generatedPDF =
                pdf;


            savePDF.disabled =
                false;


            generatePDF.innerHTML =
                "✅ PDF Ready";


        } catch (error) {

            console.error(error);


            alert(
                "Something went wrong while creating the PDF."
            );


            generatePDF.innerHTML =
                "📄 Generate PDF";

        }


        generatePDF.disabled =
            false;

    }
);


/* =========================
   SAVE TO FILE
========================= */

savePDF.addEventListener(
    "click",
    async function () {

        if (!generatedPDF) {

            alert(
                "Please generate the PDF first."
            );

            return;

        }


        /* GET FILE NAME */

        let name =
            fileName.value.trim();


        if (!name) {

            name =
                "photos-to-pdf";

        }


        /*
         * Remove invalid Windows
         * filename characters
         */

        name = name.replace(
            /[<>:"/\\|?*]/g,
            "_"
        );


        /*
         * Remove .pdf if user
         * already typed it
         */

        name = name.replace(
            /\.pdf$/i,
            ""
        );


        name += ".pdf";


        /* CREATE PDF BLOB */

        const pdfBlob =
            generatedPDF.output(
                "blob"
            );


        /*
         * MODERN BROWSERS
         * Save File Picker
         */

        if (
            "showSaveFilePicker"
            in window
        ) {

            try {

                const fileHandle =
                    await window
                        .showSaveFilePicker({

                            suggestedName:
                                name,

                            types: [

                                {

                                    description:
                                        "PDF File",

                                    accept: {

                                        "application/pdf":
                                            [".pdf"]

                                    }

                                }

                            ]

                        });


                const writable =
                    await fileHandle
                        .createWritable();


                await writable.write(
                    pdfBlob
                );


                await writable.close();


                alert(
                    "✅ PDF saved successfully!"
                );


            } catch (error) {

                /*
                 * User cancelled
                 */

                if (
                    error.name ===
                    "AbortError"
                ) {

                    return;

                }


                console.error(
                    error
                );


                alert(
                    "Unable to save the PDF."
                );

            }


        } else {

            /*
             * FALLBACK
             * Normal browser download
             */

            const url =
                URL.createObjectURL(
                    pdfBlob
                );


            const link =
                document.createElement(
                    "a"
                );


            link.href =
                url;


            link.download =
                name;


            document.body.appendChild(
                link
            );


            link.click();


            link.remove();


            URL.revokeObjectURL(
                url
            );

        }

    }
);


/* =========================
   LOAD IMAGE
========================= */

function loadImage(src) {

    return new Promise(
        (resolve, reject) => {

            const img =
                new Image();


            img.onload =
                () => resolve(img);


            img.onerror =
                reject;


            img.src =
                src;

        }
    );

}


/* =========================
   INITIAL STATE
========================= */

renderPhotos();

