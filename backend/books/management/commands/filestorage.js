var get_files_from_storage = false;
var uploading              = false;
var dragged_files_counter  = 0;

$(function() {
    $('#attachments_modal_tabs a, #attachments_modal_tabs_mobile a').click(function(e) {
        e.preventDefault();

        hideFormPlaceholderMessages('attachments_modal_content');

        current_view = $(this).attr('name');
        $("#upload, #user_files, .upload_selected_option, .user_files_selected_option").addClass('display-none');
        $('.' + current_view + '_selected_option').removeClass('display-none');
        $('.' + current_view + '_selected_option').parent().attr('name', current_view);
        $('#' + current_view).removeClass('display-none');
        $('#attachments_modal_tabs a').parent().addClass('active');
        $('#attachments_modal_tabs a').not(this).parent().removeClass('active');

        if (current_view === 'user_files') {
            $(".file_library_notification").addClass('display-none');
            if (get_files_from_storage === false) {
                $("#file_storage_wrapper").empty();
                getUserStoredFiles('GET', domain_base, 'files-storage', site_language, 'attachments_modal_content', 'file_storage_wrapper', files_storage_translations);
                get_files_from_storage = true;
            }
        }
    });

    // Attach file to conversation
    $(".attach_file").on("click", function() {
        $("#upload, #user_files, .file_library_notification, .upload_selected_option, .user_files_selected_option").addClass('display-none');
        if (get_files_from_storage === false) {
            $('#attachments_modal_tabs a').parent().removeClass('active');
            $("#file_storage_wrapper").empty();
            getUserStoredFiles('GET', domain_base, 'files-storage', site_language, 'attachments_modal_content', 'file_storage_wrapper', files_storage_translations);
            get_files_from_storage = true;
        } else {
            current_tab = $('#attachments_modal_tabs .active a').prop('name');
            $('#' + current_tab).removeClass('display-none');

            selected_option = $("#attachments_dropdown").prop('name');
            $('.' + selected_option + '_selected_option').removeClass('display-none');
            $('#' + selected_option).removeClass('display-none');
        }
    });

    // Attach file to conversation (Redesign of attachments)
    $(".attach_file_v2").on("click", function() {
        if (get_files_from_storage === false) {
            getUserStoredV2Files(user_id, services, 'attachments_modal_content', 'file_storage_wrapper', image_url);
            get_files_from_storage = true;
        }
    });

    $(document).on('click', '.user_files_dropdown', function(e) {
        e.preventDefault();

        $('.user_files_dropdown').not(this).find('.user_files_dropdown_active').removeClass('user_files_dropdown_active');
        $(this).find('.user_files_dropdown_options').toggleClass('user_files_dropdown_active');
    });

    $(document).on('click', '.download_file', function(e) {
        window.open('/' + language_url_prefix + 'user-files.html?file_id=' + $(this).data('file_id'), '_blank');
    });

    $(document).on('click', '.delete_file', function(e) {
        data               = {};
        data['csrf_token'] = $('.csrf_token').val();

        file_id = $(this).data('file_id');

        deleteUserStoredFile(
            'DELETE',
            domain_base,
            'files-storage',
            site_language,
            JSON.stringify(data),
            'user_files',
            file_id,
            files_storage_translations
        );
    });

    $(document).on('change', '#attachments_modal .file_storage_wrapper_checkbox', function() {
        var file_id = $(this).data('file_id');
        if (file_id) {
            if ($(this).prop("checked") === true) {
                var file_name = $.trim($("label[for='checkbox_file_storage_wrapper_" + file_id + "'] input[name=file_name]").val());

                appendAttachmentToSendMessagePanel(file_id, file_name);
                $(".pre_attached_file[data-file_id=" + file_id + "] .upload_file_bar").css("width", '0%');
            } else {
                $(".pre_attached_file[data-file_id=" + file_id + "]").remove();
            }

            $(this).parent(".panel").toggleClass("attached_file_checked");

            if($(this).prop("checked")) {
                $('#file_attached_success').fadeIn(1000).fadeOut(1000);
            }
        }
    });

    $(document).on('click', '.detach_file', function() {
        var file_id = $(this).closest(".pre_attached_file").data("file_id");
        $('#checkbox_file_storage_wrapper_' + file_id).prop("checked", false).parent(".panel").toggleClass("attached_file_checked");
        $(".pre_attached_file[data-file_id=" + file_id + "]").remove();
    });

    // Drag and drop file
    // File enters the page. This event fires only once.
    $(document).on('dragenter', function(event) {
        event.preventDefault();
        event.stopPropagation();

        if (event.originalEvent.dataTransfer.types.indexOf('Files') !== -1) {
            dragged_files_counter++;
            $('.upload_file_panel').addClass('image_uploader_dragging');
        }
    });

    // Prevent default behavior when dragging something over the page.
    $(document).on('dragover', function(event) {
        event.preventDefault();
        event.stopPropagation();
        $('.upload_file_panel').addClass('image_uploader_dragging');
    });

    // file is dropped onto the page. start upload procedure.
    $(document).on('drop', function(event) {
        event.preventDefault();
        event.stopPropagation();
        $('.upload_file_panel').removeClass('image_uploader_dragging');

        if (event.originalEvent.dataTransfer.files.length === 0) {
            return;
        }

        if (event.originalEvent.dataTransfer.files.length > 1) {
            return;
        }

        file = event.originalEvent.dataTransfer.files[0];

        if (uploading === true) {
            return;
        }
        dragged_files_counter = 0;

        uploadFile(file);
    });

    // file leave the browser window
    $(document).on('dragleave', function(event) {
        event.preventDefault();
        event.stopPropagation();

        dragged_files_counter--;
        if (dragged_files_counter === 0) {
            $('.upload_file_panel').removeClass('image_uploader_dragging');
        }
    });

    // Upload a file
    $(".upload_file").on("click", function() {
        $("#file_input").trigger("click");
    });

    $('#file_input').on('change', function (event) {
        file = event.target.files[0];
        if (uploading === true) {
            return;
        }
        uploadFile(file);
    });
});


/**
 * The maximum file size in megabytes
 *
 * @var int
 */
var MAX_FILE_SIZE_MB = 2;

/**
 * The maximum width in pixels
 *
 * @var int
 */
var MAX_WIDTH_PIXELS = 1024;

/**
 * The maximum height in pixels
 *
 * @var int
 */
var MAX_HEIGHT_PIXELS = 768;

/**
 * File upload error messages
 *
 * Keys are the the translation variables' keys
 * Values are strings contained in the API call's response
 *
 * @var obj
 */
var upload_error_messages = {
    storage_is_full    : "User's file libray is full",
    file_already_exists: "File already exists"
}


/**
 * Upload a file
 *
 * @param obj file The file object to upload
 */
function uploadFile(file)
{
    uploading = true;

    if (attachments_v2_enabled) {
        file_uploader_wrapper_id = 'attachments_modal_upload_file';
    } else {
        file_uploader_wrapper_id = 'upload_file';
    }
    file_uploader_wrapper_id_mobile = 'uplload_file_mobile';
  
    form_id                         = 'attachments_modal_content';
    user_files_wrapper_id           = 'file_storage_wrapper';

    hideFormPlaceholderMessages(form_id);
    $(".file_library_notification").addClass('display-none');

    if (file === undefined) {
        formValidationErrorMessage(form_id, files_storage_translations['file_IS_EMPTY']);
        uploading = false;
        return;
    }


    if (attachments_v2_enabled) {
        uploadProcessingStartV2(file_uploader_wrapper_id, file_uploader_wrapper_id_mobile)
    } else {
        formProcessingStart(file_uploader_wrapper_id);
    }

    var reader = new FileReader();
    reader.readAsArrayBuffer(file);

    reader.onloadend = function(event) {
        var file_url =  window.URL.createObjectURL(file);
        var file_bytes  = new Uint8Array(reader.result);
        var file_base64 = convertUint8ArrayToBase64(file_bytes);
        var file_header = retrieveFileHeader(file_bytes);
        var mime_type   = retrieveMimeTypeOfFile(file_header, file.name);

        if (validateMimeType(mime_type) === false) {
            formValidationErrorMessage(form_id, files_storage_translations['mime_type_INVALID']);
            if (attachments_v2_enabled) {
                uploadProcessingEndV2(file_uploader_wrapper_id, file_uploader_wrapper_id_mobile)
            } else {
                formProcessingEnd(file_uploader_wrapper_id);
            }
            uploading = false;
            return;
        }

        // Validate file's size except images
        if (image.checkMimeType(mime_type) === false) {
            file_size = convertBytesToMegabytes(file.size);
            if (file_size > MAX_FILE_SIZE_MB) {
                formValidationErrorMessage(form_id, files_storage_translations['file_size_INVALID']);
                if (attachments_v2_enabled) {
                    uploadProcessingEndV2(file_uploader_wrapper_id, file_uploader_wrapper_id_mobile)
                } else {
                    formProcessingEnd(file_uploader_wrapper_id);
                }
                uploading = false;
                return;
            }
        }

        if (!attachments_v2_enabled) {
            showAttachmentPreview(file.name, mime_type);
        } else {
            showAttachmentPreviewV2(file_url, mime_type);
        }

        // Resize images bigger than 2MB
        if ((image.checkMimeType(mime_type) === true) && (image.checkFileSize(file.size, MAX_FILE_SIZE_MB) === true)) {
            var image_draft = new Image();
            image_draft.src = "data:" + mime_type + ";base64," + file_base64;

            image_draft.onload = function() {
                file_base64 = resizeImage(image_draft, mime_type);
                if (calculateFileSizeByDataUri(file_base64, mime_type) > MAX_FILE_SIZE_MB) {
                    formValidationErrorMessage(form_id, files_storage_translations['file_size_INVALID']);
                    if (attachments_v2_enabled) {
                        uploadProcessingEndV2(file_uploader_wrapper_id, file_uploader_wrapper_id_mobile)
                    } else {
                        resetUploadFileCanvas();
                        formProcessingEnd(file_uploader_wrapper_id);
                    }
                    uploading = false;
                    return;
                }

                makeUploadFileRequest(
                    file.name,
                    mime_type,
                    file_base64,
                    'POST',
                    domain_base,
                    'files-storage',
                    form_id,
                    file_uploader_wrapper_id,
                    user_files_wrapper_id,
                    files_storage_translations,
                    site_language
                );
            }
        }

        if ((image.checkMimeType(mime_type) === false) || (image.checkFileSize(file.size, MAX_FILE_SIZE_MB) === false)) {
            makeUploadFileRequest(
                file.name,
                mime_type,
                file_base64,
                'POST',
                domain_base,
                'files-storage',
                form_id,
                file_uploader_wrapper_id,
                user_files_wrapper_id,
                files_storage_translations,
                site_language
            );
        }
    };

    reader.onerror = function(error) {
        formValidationErrorMessage(form_id, translations['base64_convert_error']);
        if (attachments_v2_enabled) {
            uploadProcessingEndV2(file_uploader_wrapper_id, file_uploader_wrapper_id_mobile)
        } else {
            resetUploadFileCanvas();
            formProcessingEnd(file_uploader_wrapper_id);
        }
        uploading = false;
        return;
    };
}


/**
 * Make the upload file ajax request
 *
 * Prepare payload data:
 * Strip all non alpha-numeric and period (.) characters from the file name and truncate it to 150 characters
 * Removes meta information from the data URLS (e.g base64 strings),
 * as the web service can only handle data URLS if they do not contain the meta information part.
 *
 * @param str file_name                The file name
 * @param str file_type                The file type
 * @param str file_base64              The file base64
 * @param str method_type              What method type to pass with the request (GET, POST, etc)
 * @param str domain_base              The domain base part of the url path to call
 * @param str url_path                 The url path (aka service) to call
 * @param str form_id                  The id of the form
 * @param str file_uploader_wrapper_id The id of file wrapper
 * @param str user_files_wrapper_id    The id of user files wrapper
 * @param obj translations             The JS translations
 * @param str site_language            The site language used for the translations of error/success messages
 */
function makeUploadFileRequest(
    file_name,
    file_type,
    file_base64,
    method_type,
    domain_base,
    url_path,
    form_id,
    file_uploader_wrapper_id,
    user_files_wrapper_id,
    translations,
    site_language
) {
    data = {
        file_name: file_name.replace(/[^\w\d_.]/g, '_').substring(0, 150),
        mime_type: file_type,
        file_base64: file_base64.slice(file_base64.indexOf(',') + 1),
        csrf_token: $('.csrf_token').val()
    }

    if (attachments_v2_enabled) {
        uploadFileToUserLibraryV2(
            user_id,
            form_id,
            file_uploader_wrapper_id,
            user_files_wrapper_id,
            translations,
            data,
            site_language,
            image_url
        );
    } else {
        uploadFileToUserLibrary(
            method_type,
            domain_base,
            url_path,
            form_id,
            file_uploader_wrapper_id,
            translations,
            data,
            site_language
        );
    }
}


/**
 * Resize image
 *
 * Calculate the new image's dimensions based on maximum width, height and ratio
 * Create HTML5 Canvas element with the new dimensions and draw the content of image there
 *
 * @param obj image     The image dom element
 * @param str mime_type The mime type
 *
 * @return str          The resized image as data url string
 */
function resizeImage(image, mime_type)
{
    var original_width  = image.width;
    var original_height = image.height;

    if (original_width > original_height && original_width > MAX_WIDTH_PIXELS) {
        image.width  = MAX_WIDTH_PIXELS;
        image.height = MAX_WIDTH_PIXELS * (original_height / original_width);
    } else if (image.height > MAX_HEIGHT_PIXELS) {
        image.height = MAX_HEIGHT_PIXELS;
        image.width  = MAX_HEIGHT_PIXELS * (original_width / original_height);
    }

    var canvas = document.createElement('canvas');
    canvas.width  = image.width;
    canvas.height = image.height;

    var canvas_context = canvas.getContext('2d');
    canvas_context.drawImage(image, 0, 0, image.width, image.height);

    return canvas_context.canvas.toDataURL(image, mime_type, 0.8);
}


/**
 * Get the user files that are stored to the storage
 *
 * @param method_type        The get method type
 * @param domain_base        The domain base of the url
 * @param url_path           The remaining url path
 * @param site_language      The site language
 * @param element_id         The element id
 * @param element_wrapper_id The id of element wrapper
 * @param obj translations   The JS translations
 */
function getUserStoredFiles(method_type, domain_base, url_path, site_language, element_id, element_wrapper_id, files_storage_translations)
{
    formProcessingStart(element_id);

    $.when(
        getApiResponse(method_type, domain_base, url_path)
    )
    .done(function(response) {
        $("#empty_file_library").addClass('display-none');
        $('.user_files_selected_option').removeClass('display-none')
        $('.user_files_selected_option').parent().attr('name', 'user_files');

        files = response._embedded["files-storage"];
        $.each(files, function(index, file) {
            if (file.file_id) {
                displayFileElement(file.file_name, file.mime_type, file.file_id, element_wrapper_id, files_storage_translations);
            }
        });

        $(".pre_attached_file").each(function() {
            var file_id = $(this).data("file_id");
            $('#checkbox_file_storage_wrapper_' + file_id).prop("checked", true).parent(".panel").toggleClass("attached_file_checked");
        });

        $("#attachments_modal_tabs a[name=user_files]").parent().addClass('active');
        $("#attachments_modal_content #user_files").removeClass('display-none');
        $("#attachments_modal_content #upload").addClass('display-none');
    })
    .fail(function(response) {
        response_status = response.status.toString();
        if (response_status == '404') {
            $("#attachments_modal_tabs a[name=upload]").parent().addClass('active');
            $("#attachments_modal_content #upload").removeClass('display-none');
            $('.upload_selected_option').removeClass('display-none');
            $('.upload_selected_option').parent().attr('name', 'upload');
            $("#empty_file_library").removeClass('display-none');
            return;
        }

        get_files_from_storage = false;
        handleFailedRequest(response, domain_base, site_language);
    })
    .always(function() {
        formProcessingEnd(element_id);
    });
}


/**
 * Get user stored files for v2 of attachments pop up
 *
 * @param str user_id               The user id
 * @param obj services              An object with services url
 * @param str form_id               The form id
 * @param str user_files_wrapper_id The user's files wrapper id
 * @param str image_url             The image url
 */
function getUserStoredV2Files(user_id, services, form_id, user_files_wrapper_id, image_url)
{
    formProcessingStart(form_id);

    $.when(
        services.files_storage.getUserStoredFiles(user_id)
    ).done(function(storage_files_response) {
        $.ajax({
            url: '/ajax/getTemplate.php',
            type: "POST",
            data: {
                template_path: 'messaging_system/blocks/files_storage_wrapper.html',
                template_data: {
                    files: storage_files_response._embedded["files-storage"],
                    image_url: image_url
                }
            }
        }).done(function(template_response) {
            $('#' + user_files_wrapper_id).append(template_response);
        }).always(function() {
            formProcessingEnd(form_id);
        });
    }).fail (function() {
        get_files_from_storage = false;
        formProcessingEnd(form_id);
    });
}


/**
 * Make the ajax call to file storage ws to store the file
 *
 * @param str method_type              What method type to pass with the request (GET, POST, etc)
 * @param str domain_base              The domain base part of the url path to call
 * @param str url_path                 The url path (aka service) to call
 * @param str form_id                  The id of the form
 * @param str file_uploader_wrapper_id The id of file wrapper
 * @param obj translations             The JS translations
 * @param obj data                     The payload data, file's details and csrf token
 * @param str site_language            The site language used for the translations of error/success messages
 */
function uploadFileToUserLibrary(method_type, domain_base, url_path, form_id, file_uploader_wrapper_id, translations, data, site_language)
{
    $.when(
        getApiResponse(method_type, domain_base, url_path, JSON.stringify(data))
    )
    .done(function(response) {
        get_files_from_storage = false;
        formSuccessMessage(form_id, translations['upload_success']);
        $('#' + form_id + ' #success-placeholder').delay(3000).fadeOut(400);
        completeUploadProcess(response.file_id, response.file_name);
        resetMessagePanel();
    })
    .fail(function(response) {
        error_message = getErrorMessageKeyByResponse(response, upload_error_messages);
        resetUploadFileCanvas();
        uploading = false;

        if (responseContainsFormValidationErrors(response)) {
            $.each(response.responseJSON.detail, function(input_name, validation_result) {
                if (validation_result !== 'VALID') {
                    formValidationErrorMessage(form_id, translations[input_name + '_' + validation_result]);
                    $('#' + form_id + ' #validation-error-placeholder').delay(3000).fadeOut(400);
                }
            });
        } else if (error_message !== '') {
            formValidationErrorMessage(form_id, translations[error_message]);
        } else {
            handleFailedRequest(response, domain_base, site_language);
        }
    })
    .always(function() {
        formProcessingEnd(file_uploader_wrapper_id);
    });
}


/**
 * Make the ajax call to file storage ws to store the file
 *
 * @param str user_id                  The user id
 * @param str form_id                  The id of the form
 * @param str file_uploader_wrapper_id The id of file wrapper
 * @param str user_files_wrapper_id    The id of user_files_wrapper_id
 * @param obj translations             The JS translations
 * @param obj data                     The payload data, file's details and csrf token
 * @param str site_language            The site language used for the translations of error/success messages
 * @param str image_url                The image url
 */
function uploadFileToUserLibraryV2(user_id, form_id, file_uploader_wrapper_id, user_files_wrapper_id, translations, data, site_language, image_url)
{
    console.log('hi there');
    $.when(
        services.files_storage.uploadFileToUserLibrary(user_id, JSON.stringify(data))
    )
    .done(function(file_response) {
        $.ajax({
            url: '/ajax/getTemplate.php',
            type: "POST",
            data: {
                template_path: 'messaging_system/blocks/files_storage_element.html',
                template_data: {
                    attachment: {
                        file_id: file_response.file_id,
                        file_name: file_response.file_name,
                        mime_type: data.mime_type
                    },
                    image_url: image_url
                }
            }
        }).done(function(template_response) {
            formSuccessMessage(form_id, translations['upload_success']);
            $('#' + form_id + ' #success-placeholder').delay(3000).fadeOut(400);
            $('#' + user_files_wrapper_id).prepend(template_response);
        }).always(function() {
            uploadProcessingEndV2(file_uploader_wrapper_id, file_uploader_wrapper_id_mobile)
        });
    })
    .fail(function(response) {
        error_message = getErrorMessageKeyByResponse(response, upload_error_messages);
        resetUploadFileCanvas();
        uploading = false;

        if (responseContainsFormValidationErrors(response)) {
            $.each(response.responseJSON.detail, function(input_name, validation_result) {
                if (validation_result !== 'VALID') {
                    formValidationErrorMessage(form_id, translations[input_name + '_' + validation_result]);
                    $('#' + form_id + ' #validation-error-placeholder').delay(3000).fadeOut(400);
                }
            });
        } else if (error_message !== '') {
            formValidationErrorMessage(form_id, translations[error_message]);
        } else {
            handleFailedRequest(response, domain_base, site_language);
        }

        formProcessingEnd(file_uploader_wrapper_id);
    })
}


/**
 * Delete a user's file from their storage
 *
 * @param str method_type   The delete method type
 * @param str domain_base   The domain base part of the url path to call
 * @param str url_path      The url path (aka service) to call
 * @param str site_language The language the user is viewing the site in
 * @param str data          The data
 * @param str element_id    The element id
 * @param str file_id       The file id
 * @param arr translations  The translations array
 */
function deleteUserStoredFile(method_type, domain_base, url_path, site_language, data, element_id, file_id, translations)
{
    formProcessingStart(element_id);

    url_path += '&file_id=' + file_id;
    $.when(
        getApiResponse(method_type, domain_base, url_path, data)
    )
    .done(function(response) {
        $('label[for=checkbox_file_storage_wrapper_' + file_id + ']').parent().addClass('display-none');
        $('.pre_attached_file[data-file_id=' + file_id + ']').remove();
        $('.download_attachment_conversation[data-file_id=' + file_id + ']').addClass('display-none');
        $('.remove_attachment[data-file_id=' + file_id + ']').addClass('display-none');
        $('.deleted_file[data-file_id=' + file_id + ']').removeClass('display-none');
        get_files_from_storage = false;
    })
    .fail(function(response) {
        response_status = response.status.toString();
        if (response_status === '404') {
            return;
        }

        handleFailedRequest(response, domain_base, site_language);
    })
    .always(function() {
        formProcessingEnd(element_id);
    });
}


/**
 * Initialize message panel after upload process has been stopped (success or fail)
 * - End the loader at message panel
 * - Remove the preview of attachment from message panel
 * - Initialize file input
 */
function resetMessagePanel()
{
    $('#file_being_uploaded').remove();
    formProcessingEnd('pre_attached_file');
    $('#file_input').val(null);
    $('.send_messages').prop('disabled', false);

    $('#message_input').css('height', 'initial');
    $('#messages_container').css('margin-bottom', $('.send_message_wrapper').outerHeight());
}


/**
 * Function to reset upload file canvas
 */
function resetUploadFileCanvas()
{
    $('.upload_file_panel').css("border", "3px dashed #F0871F");
    $('.upload_file_bar').css('width', '0');
    $('#upload_file_iniital_state').removeClass('display-none');
    $('#uploaded_file').remove();
    $('#upload_progress_bar').remove();
}


/**
 * Notify user that the upload process has been completed successfully
 * - Append the attachment at message panel
 * - Complete the progress of upload bar
 * - Add some css style indicators at cloud storage file icon to notify user where the uploaded file is stored
 *
 * @param int file_id   The file id
 * @param str file_name The file's name
 */
function completeUploadProcess(file_id, file_name)
{
    appendAttachmentToSendMessagePanel(file_id, file_name);

    $(".file_library_notification").removeClass('display-none');

    for (i = 0; i < 3; i++) {
       $('#user_files_tab').animate({marginTop: '-='+ '10px'}, 300).animate({marginTop: '+='+ '10px'},300);
    }

    showProgressBar(".upload_file_bar", 50, 100);
    setTimeout(function() {
        resetUploadFileCanvas();
        uploading = false;
    }, 3000);
}


/**
 * Calculate the file size based on data uri
 *
 * Exclude from total size of data_uri, the header of data uri and an overhead caused by encoding
 *
 * @param str data_uri  The data uri of the file to determine the size of
 * @param str mime_type The mime type
 *
 * @return int          The file size at megabytes
 */
function calculateFileSizeByDataUri(data_uri, mime_type)
{
    var head = 'data:' + mime_type + ';base64,';
    var file_size = Math.round((data_uri.length - head.length) * 0.75);

    return convertBytesToMegabytes(file_size);
}


/**
 * Convert the file size from bytes to MB
 *
 * @param int size The file size in bytes
 *
 * @return int     The file size in MB
 */
function convertBytesToMegabytes(size)
{
    return size / Math.pow(1024, 2);
}


/**
 * Show the progress bar of uploading process
 *
 * @param str selector     The selector of progress bar
 * @param int inital_width The initial width of progress bar
 * @param int final_width  The final width of progress bar
 */
function showProgressBar(selector, inital_width, final_width)
{
    var bar_width = inital_width;
    var progress = setInterval(function() {
        if (bar_width >= final_width) {
            clearInterval(progress);
        } else {
            bar_width++;
            $(selector).css("width", bar_width + '%');
        }
    }, 10);
}


/**
 * Append a preview of attachment at canvas region
 * while the file is uploading
 *
 * @param str file_name  The file_name of attachment
 * @param str mime_type  The mime type of attachment
 */
function showAttachmentPreview(file_name, mime_type)
{
    file_type_icon_path = getMimeTypeIconPath(mime_type, '_large');

    $('#upload_file_iniital_state').addClass('display-none');

    $('#attachments_modal_upload_file').append(
        '<div id="uploaded_file" class="row" style="margin-bottom:70px;">' +
            '<div class="col-xs-6 col-xs-offset-3 mb20" style="margin-top:50px;">' +
                '<img src="'+ file_type_icon_path + '" height="100">' +
            '</div>' +

            '<div class="col-xs-10 col-xs-offset-1 truncate_title">' +
                file_name +
            '</div>' +
        '</div>' +

        '<div id="upload_progress_bar" class="row">' +
            '<div class="col-xs-12">' +
                '<div class="upload_file_bar"></div>' +
            '</div>' +
        '</div>'
    );
}


/**
 * Append a preview of attachment at canvar region
 */
function showAttachmentPreviewV2(file_url, mime_type)
{
    $('#file_storage_wrapper').prepend(
        '<div class="col-md-4">' +
            '<label class="cursor-pointer display-block">' +
                '<div class="panel">' +
                   '<div class="panel-body>' +
                        '<img class="attachment_thumbnail cursor-pointer" src="' + file_url + '">' +
                    '</div>' +
                '</div>' +
            '</label>'
        '</div>'
    );
}


/**
 * Append attachment to send message panel of conversation
 *
 * @param str file_id  The file id of attachment
 * @param str file_name The file_name of attachment
 */
function appendAttachmentToSendMessagePanel(file_id, file_name)
{
    var emement_to_append =
        '<div class="message_input_wrapper pre_attached_file" data-file_id="' + file_id + '">' +
            '<input type="hidden" name="content" value="' + file_id + '">' +
            '<input type="hidden" name="message_type" value="attached_file">' +
            '<input type="hidden" name="file_name_' + file_id + '" value="' + file_name + '">' +

            '<div class="row">' +
                '<div class="col-xs-10 truncate_title">' +
                    '<span class="glyphicon glyphicon-paperclip" aria-hidden="true" style="margin-right: 10px;"></span>' +
                    '<b>' + file_name + '</b>' +
                '</div>' +

                '<div class="col-xs-2">' +
                    '<button class="close detach_file" type="button">' +
                        '<span class="position-relative link_color" aria-hidden="true" style="font-size: 28px; bottom: 5px;">&times;</span>' +
                    '</button>' +
                '</div>' +
            '</div>' +
        '</div>';

    $(emement_to_append).insertBefore(".message_input_wrapper:first");
}


/**
 * Display a file element to a modal. Long file names are truncated.
 *
 * @param str file_name           The file name
 * @param str mime                The mime type of the file
 * @param str file_id             The file's id
 * @param str element_wrapper_id  The element wrapper id
 * @param obj translations        The JS translations
 */
function displayFileElement(file_name, mime, file_id, element_wrapper_id, translations)
{
    icon = getMimeTypeIconPath(mime);

    $('#' + element_wrapper_id).append(
        '<div class="col-md-6">' +
            '<label class="cursor-pointer" for="checkbox_' + element_wrapper_id + '_' + file_id + '" style="width:95%;">'  +
                '<input type="hidden" name="file_name" value="' + file_name + '">' +
                '<div class="row panel panel-body" style="padding: 7px 0;box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);">' +
                    '<input id="checkbox_' + element_wrapper_id + '_' + file_id + '" class="display-none ' + element_wrapper_id + '_checkbox" data-file_id="' + file_id + '" type="checkbox">' +
                    '<div class="col-xs-2">' +
                        '<img src="'+ icon + '">' +
                    '</div>' +

                    '<div class="col-xs-8 mt5 truncate_title">' +
                        file_name +
                    '</div>' +

                    '<div class="col-xs-2 position-relative user_files_dropdown">' +
                        '<span class="glyphicons glyphicons-option-vertical mt5"></span>' +
                        '<div class="user_files_dropdown_options">' +
                            '<a class="delete_file" data-file_id="' + file_id + '">' +
                                '<span class="glyphicon glyphicon-trash"></span>' +
                                '&nbsp;' + translations['delete_file'] +
                            '</a>' +
                            '<hr style="margin: 0; border-width: 2px;">' +
                            '<a class="download_file" data-file_id="' + file_id + '">' +
                                '<span class="glyphicon glyphicon-download-alt"></span>' +
                                '&nbsp;' + translations['download_file'] +
                            '</a>' +
                        '</div>'+
                    '</div>' +
                '</div>' +
            '</label>' +
        '</div>'
    );
}


/**
 * Validate the mime type of file
 *
 * @param str mime_type The mime type
 *
 * @return boo          The validation result true, false
 */
function validateMimeType(mime_type) {
    valid_mime_types = [
        'text/plain',
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/heic',
        'image/heic-sequence',
        'image/heif',
        'image/heif-sequence',
        'image/gif',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/zip',
        'application/x-7z-compressed',
        'application/x-zip-compressed',
        'application/x-bzip',
        'application/x-bzip2',
        'video/mp4',
        'video/x-flv',
        'video/3gpp',
        'video/quicktime',
        'video/avi',
        'video/x-ms-wmv',
        'audio/basic',
        'audio/mid',
        'audio/mpeg',
        'audio/mp4',
        'audio/aiff',
        'audio/mpegurl',
        'audio/vnd.rn-realaudio',
        'audio/ogg',
        'audio/wav',
        'audio/amr'
    ];

    if (valid_mime_types.indexOf(mime_type) == -1) {
        return false;
    }

    return true;
}


/**
 * Get the path of an icon based on the mime type provided
 *
 * @param str mime_type The mime type
 * @param str icon_size The icon size
 *
 * return icon the file icon
 */
function getMimeTypeIconPath(mime_type, icon_size) {
    if (typeof icon_size  == 'undefined') {
        icon_size ="";
    }

    var icon_path = domain_base + 'img/icons/';

    switch (mime_type) {
        case 'text/plain':
            icon_path += 'icon_txt' + icon_size + '.png';
            break;

        case 'application/pdf':
            icon_path += 'icon_pdf' + icon_size + '.png';
            break;

        case 'image/jpeg':
        case 'image/heic':
        case 'image/heic-sequence':
        case 'image/heif':
        case 'image/heif-sequence':
            icon_path += 'icon_jpeg' + icon_size + '.png';
            break;

        case 'image/png':
            icon_path += 'icon_png' + icon_size + '.png';
            break;

        case 'image/gif':
            icon_path += 'icon_gif' + icon_size + '.png';
            break;

        case 'application/msword':
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
            icon_path += 'icon_word' + icon_size + '.png';
            break;

        case 'application/vnd.ms-excel':
        case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
            icon_path += 'icon_excel' + icon_size + '.png';
            break;

        case 'application/zip':
        case 'application/x-zip-compressed':
        case 'application/x-7z-compressed':
        case 'application/x-bzip':
        case 'application/x-bzip2':
            icon_path += 'icon_zip' + icon_size + '.png';
            break;

        case 'video/mp4':
        case 'video/x-flv':
        case 'video/3gpp':
        case 'video/quicktime':
        case 'video/avi':
        case 'video/x-ms-wmv':
            icon_path += 'icon_video' + icon_size + '.png';
            break;

        case 'audio/basic':
        case 'audio/mid':
        case 'audio/mpeg':
        case 'audio/mp4':
        case 'audio/aiff':
        case 'audio/mpegurl':
        case 'audio/vnd.rn-realaudio':
        case 'audio/ogg':
        case 'audio/wav':
        case "audio/amr":
            icon_path += 'icon_avi' + icon_size + '.png';
            break;

        default:
            break;
    }

    return icon_path;
}

/** 
 * Start uloading process
 * - Display the loader
 * - Disable the buttons
 *
 * @param str file_uploader_wrapper_id        The selector of file uploader element
 * @param str file_uploader_wrapper_id_mobile The selector of file uploader element for mobile
 */
function uploadProcessingStartV2(file_uploader_wrapper_id, file_uploader_wrapper_id_mobile)
{
    displayLoadingIcon(file_uploader_wrapper_id);
    displayLoadingIcon(file_uploader_wrapper_id_mobile);
    $('.upload_file').prop('disabled', true);
}


/** 
 * End uloading process
 * - Hide the loader
 * - Enable the buttons
 *
 * @param str file_uploader_wrapper_id        The selector of file uploader element
 * @param str file_uploader_wrapper_id_mobile The selector of file uploader element for mobile
 */
function uploadProcessingEndV2(file_uploader_wrapper_id, file_uploader_wrapper_id_mobile)
{
    removeLoadingIcon(file_uploader_wrapper_id);
    removeLoadingIcon(file_uploader_wrapper_id_mobile);
    $('.upload_file').prop('disabled', false);
}
