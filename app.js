Dropzone.autoDiscover = false;

function init() {
    let dz = new Dropzone("#dropzone", {
        url: "/",
        maxFiles: 1,
        addRemoveLinks: true,
        dictDefaultMessage: "Drop files here or click to upload",
        autoProcessQueue: false
    });

    // Ensure only one file is uploaded
    dz.on("addedfile", function() {
        if (dz.files[1] != null) {
            dz.removeFile(dz.files[0]);        
        }
    });

    dz.on("complete", function (file) {
        let imageData = file.dataURL;
        let url = "http://127.0.0.1:5000/classify_image";

        $.post(url, { image_data: imageData }, function(data, status) {
            console.log(data);

            if (!data || data.length === 0) {
                $("#resultHolder").hide();
                $("#divClassTable").hide();
                $("#error").show();
                return;
            }

            let match = null;
            let bestScore = -1;

            for (let i = 0; i < data.length; i++) {
                let maxScoreForThisClass = Math.max(...data[i].class_probability);
                if (maxScoreForThisClass > bestScore) {
                    match = data[i];
                    bestScore = maxScoreForThisClass;
                }
            }

            if (match) {
                $("#error").hide();
                $("#resultHolder").show();
                $("#divClassTable").show();
                
                // Ensure it selects actor instead of player
                $("#resultHolder").html($(`[data-actor="${match.class}"]`).html());

                let classDictionary = match.class_dictionary;
                for (let actor in classDictionary) {
                    let index = classDictionary[actor];
                    let probabilityScore = match.class_probability[index];
                    let elementName = "#score_" + actor.replace(" ", "_");
                    $(elementName).html(probabilityScore.toFixed(2) + "%");
                }
            }
        });
    });

    // Process image classification on button click
    $("#submitBtn").on('click', function () {
        dz.processQueue();		
    });
}

$(document).ready(function() {
    console.log("Page ready!");
    $("#error").hide();
    $("#resultHolder").hide();
    $("#divClassTable").hide();

    init();
});
