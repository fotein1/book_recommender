/**
 * Define all web services api calls
 *
 * @param obj global    The Global Object (scope = window)
 * @param obj $         The jQuery Object (dependency)
 * @param obj ApiCaller The ApicCaller object
 */
(function(global, $, ApiCaller) {
    "use strict";

    if (typeof $ === "undefined") {
        throw new Error("Services: jQuery object is not defined. Is jQuery script loaded?");
    }

    if (typeof ApiCaller === "undefined") {
        throw new Error("Services: ApiCaller object is not defined. Is apicaller script loaded?");
    }

    /**
     * Define all web services calls
     *
     * @type {Object}
     */
    global.services = {
        /**
         * Api calls for profile extras web service
         *
         * @type {Object}
         */
        profile_extras: {
            /**
             * Update profile extra details for a user
             *
             * @param int user_id The user id
             * @param arr data    An array with data
             *
             * @return obj        Return the deffered ajax object
             */
            updateProfileExtrasByUserId: function(user_id, data) {
                var url_path = '/api/profile-extras/' + user_id;

                return global.api_caller.makeAjaxCall('PUT', url_path, true, data);
            }
        },


        /**
         * Api calls for profiles web service
         *
         * @type {Object}
         */
        profiles: {
            /**
             * Update profile for a user
             *
             * @param int user_id The user id
             * @param arr data    An array with data
             *
             * @return obj        Return the deffered ajax object
             */
            updateProfileByUserId: function(user_id, data) {
                var url_path = '/api/profiles/' + user_id;

                return global.api_caller.makeAjaxCall('PUT', url_path, true, data);
            }
        },

        /**
         * Api calls for conversation settings web service
         *
         * @type {Object}
         */
        conversation_settings: {
            /**
             * Api call to patch share email by user id method
             *
             * @param int user_id The user id
             * @param arr data    An array with data
             *
             * @return obj        Return the deffered ajax object
             */
            patchShareEmailByUserId: function(user_id, data) {
                var url_path = '/api/conversation-settings/share-email/users/' + user_id;

                return global.api_caller.makeAjaxCall('PATCH', url_path, true, data);
            },

            /**
             * Api call to patch conversations default list by user id method
             *
             * @param int user_id The user id
             * @param arr data    An array with data
             *
             * @return obj        Return the deffered ajax object
             */
            patchConversationsDefaultListByUserId: function(user_id, data) {
                var url_path = '/api/conversation-settings/default-list/users/' + user_id;

                return global.api_caller.makeAjaxCall('PATCH', url_path, true, data);
            }
        },

        /**
         * Api calls for conversation web services
         *
         * @type {Object}
         */
        conversations: {

        },

        /**
         * Api calls for conversation tags web services
         */
        conversation_tags: {
            /**
             * Api call to get user conversation tags
             *
             * @param int user_id The user id
             *
             * @return obj        Return the deffered ajax object
             */
            getTagsByUserId: function() {
                var url_path = '/api/conversation-tags';

                return global.api_caller.makeAjaxCall('GET', url_path, true);
            },

            /*
             * Api call to create a new conversation tag by user id
             *
             * @param int user_id The user id
             * @param arr data    An array with payload data
             *
             * @return obj        Return the deffered ajax object
             */
            createTagByUserId: function(user_id, data) {
                var url_path = '/api/conversation-tags/users/' + user_id;

                return global.api_caller.makeAjaxCall('POST', url_path, true, data);
            },

            /*
             * Api call to update a tag by user id
             *
             * @param int user_id The user id
             * @param arr data    An array with payload data
             *
             * @return obj        Return the deffered ajax object
             */
            updateTagByUserId: function(user_id, data) {
                var url_path = '/api/conversation-tags/users/' + user_id;

                return global.api_caller.makeAjaxCall('PUT', url_path, true, data);
            },

            /*
             * Api call to delete a tag by user id
             *
             * @param int user_id The user id
             * @param arr data    An array with payload data
             *
             * @return obj        Return the deffered ajax object
             */
            deleteTagByUserId: function(user_id, data) {
                var url_path = '/api/conversation-tags/users/' + user_id;

                return global.api_caller.makeAjaxCall('DELETE', url_path, true, data);
            }
        },

        /**
         * Api calls for files storage web service
         *
         * @type {Object}
         */
        files_storage: {
            /**
             * Api call to get user's stored files
             *
             * @param int user_id The user id
             *
             * @return obj        Return the deffered ajax object
             */
            getUserStoredFiles: function(user_id) {
                var url_path = '/api/files-storage/users/' + user_id;

                return global.api_caller.makeAjaxCall('GET', url_path, true);
            },

            /**
             * Api call to upload file to user's library
             *
             * @param int user_id The user id
             * @param obj data    The provided data
             *
             * @return obj        Return the deffered ajax object
             */
            uploadFileToUserLibrary: function(user_id, data) {
                var url_path = '/api/files-storage/users/' + user_id;

                return global.api_caller.makeAjaxCall('POST', url_path, true, data);
            },

            /**
             * Api call to delete a stored file form user library
             *
             * @param int user_id The user id
             * @param int file_id The file id
             * @param arr data    An array with supplied data
             *
             * @return obj        Return the deffered ajax object
             */
            deleteUserStoredFile: function(user_id, file_id, data) {
                var url_path = '/api/files-storage/users/' + user_id + '/files/' + file_id;

                return global.api_caller.makeAjaxCall('DELETE', url_path, true, data);
            }
        },

        /**
         * Api calls for location web services
         *
         * @type {Object}
         */
        location: {
            /**
             * Api call to get city based on search query
             *
             * @param str query The search query
             *
             * @return obj      Return the deffered ajax object
             */
            getCitiesBySearchQuery: function(query) {
                var url_path = '/api/location/cities/names/' + query;

                return global.api_caller.makeAjaxCall('GET', url_path);
            },


            /**
             * Api call to get districts
             *
             * @param str language The language
             * @param int city_id  The city id
             * @param int category The category
             *
             * @return obj         Return the deffered ajax object
             */
            getDistrictsByCityIdLanguageAndCategory: function(language, city_id, category) {
                var url_path = '/api/location/districts/languages/' + language + '/cities/' + city_id + '/categories/' + category;

                return global.api_caller.makeAjaxCall('GET', url_path);
            }
        },

        /**
         * Api calls for offers web services
         *
         * @type {Object}
         */
        offers: {
            /**
             * Update the deactivated status of offer by offer_id
             *
             * @param int user_id  The user id
             * @param int offer_id The offer id
             * @param arr data     An array with data
             *
             * @return obj         Return the deffered ajax object
             */
            updateDeactivatedStatusByOfferId: function(user_id, offer_id, data) {
                var url_path = '/api/offers/' + offer_id + '/users/' + user_id;

                return global.api_caller.makeAjaxCall('PATCH', url_path, true, data);
            },

            /**
             * Publish an offer by draft id for a user
             *
             * @param int draft_id The draft id
             * @param int user_id  The user id
             * @param arr data     An array with data
             *
             * @return obj         Return the deffered ajax object
             */
            publishOfferByDraftId: function(draft_id, user_id, data) {
                var url_path = '/api/offers/drafts/' + draft_id + '/users/' + user_id;

                return global.api_caller.makeAjaxCall('POST', url_path, true, data);
            },

            /**
             * Update an offer by offer id for a user
             *
             * @param int offer_id The offer id
             * @param int user_id  The user id
             * @param arr data     An array with data
             *
             * @return obj         Return the deffered ajax object
             */
            updateOfferByOfferId: function(offer_id, user_id, data) {
                var url_path = '/api/offers/' + offer_id + '/users/' + user_id;

                return global.api_caller.makeAjaxCall('PUT', url_path, true, data);
            }
        },

        /**
         * Api calls for requests web services
         *
         * @type {Object}
         */
        requests: {
            /**
             * Update the deactivated status of request by request_id
             *
             * @param int user_id    The user id
             * @param int request_id The reqeust id
             * @param arr data       An array with data
             *
             * @return obj           Return the deffered ajax object
             */
            updateDeactivatedStatusByRequestId: function(user_id, request_id, data) {
                var url_path = '/api/requests/' + request_id + '/users/' + user_id;

                return global.api_caller.makeAjaxCall('PATCH', url_path, true, data);
            },

            /**
             * Publish a request by draft id for a user
             *
             * @param int draft_id The draft id
             * @param int user_id  The user id
             * @param arr data     An array with data
             *
             * @return obj         Return the deffered ajax object
             */
            publishRequestByDraftId: function(draft_id, user_id, data) {
                var url_path = '/api/requests/drafts/' + draft_id + '/users/' + user_id;

                return global.api_caller.makeAjaxCall('POST', url_path, true, data);
            },

            /**
             * Update a request by request id for a user
             *
             * @param int request_id The request id
             * @param int user_id    The user id
             * @param arr data       An array with data
             *
             * @return obj           Return the deffered ajax object
             */
            updateRequestByRequestId: function(request_id, user_id, data) {
                var url_path = '/api/requests/' + request_id + '/users/' + user_id;

                return global.api_caller.makeAjaxCall('PUT', url_path, true, data);
            }
        },

        /**
         * Api calls for drafts web services
         *
         * @type {Object}
         */
        drafts: {
            /**
             * Create a draft.
             *
             * @param int user_id The user id
             * @param arr data    The payload data
             *
             * @return obj        Return the deffered ajax object
             */
            createDraftByUserId: function(user_id, data) {
                var url_path = '/api/drafts/users/' + user_id;

                return global.api_caller.makeAjaxCall('POST', url_path, true, data);
            },

            /**
             * Update a draft.
             *
             * @param int draft_id The draft id
             * @param int user_id  The user id
             * @param arr data     The payload data
             *
             * @return obj         Return the deffered ajax object
             */
            updateDraftByDraftIdAndUserId: function(draft_id, user_id, data) {
                var url_path = '/api/drafts/' + draft_id + '/users/' + user_id;

                return global.api_caller.makeAjaxCall('PUT', url_path, true, data);
            },

            /**
             * Delete a draft by user id and draft id
             *
             * @param int draft_id The draft id
             * @param int user_id  The user id
             * @param arr data     The payload data
             *
             * @return obj         Return the deffered ajax object
             */
            deleteDraftByDraftIdAndUserId: function(draft_id, user_id, data) {
                var url_path = '/api/drafts/' + draft_id + '/users/' + user_id;

                return global.api_caller.makeAjaxCall('DELETE', url_path, true, data);
            },
        },


        /**
         * Api calls for Ads descriptions translations web service
         *
         * @type {Object}
         */
        ads_descriptions_translations: {
            /**
             * Make an ajax call to translate the ad's descriptions
             *
             * @param obj data The payload data
             *
             * @return obj     Return the deffered ajax object
             */
            translateAdsDescriptions: function(data) {
                var url_path = '/api/ad-description-translations';

                return global.api_caller.makeAjaxCall('POST', url_path, false, data);
            }
        }
    }
})(window, $, ApiCaller);
