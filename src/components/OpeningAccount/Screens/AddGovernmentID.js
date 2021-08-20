import React, { useReducer, useRef, useEffect } from 'react';
import { jsPDF as JsPDF } from 'jspdf'
import Lang from '../../Inc/Lang/Lang'
import userTypeEnum from '../../../constants/user_type_enum';
import Form, { TYPE } from '../../Inc/Form/Form'
import { clone, diff } from '../../../helper/functionUtils'
import s from '../OpeningAccount.module.css'
import SvgIcon, { path } from '../../Inc/SvgIcon/SvgIcon'
import { OPTIONS, FIELD, SCREEN, BUTTON, CMA, GOVERNMENT_ID_TYPE, DOCUMENT_TYPE, DOCUMENT_STATUS, UPLOAD_TYPE } from '../constant'
import { getOpeningAccountUrl, putData } from '../../../helper/request'
import { EVENTNAME, dispatchEvent, addEventListener, removeEventListener } from '../../../helper/event'
import Button, { buttonType } from '../../Elements/Button/Button';
import dataStorage from '../../../dataStorage'

const applicantDropdown = (listData) => {
    let applicantOptions = listData.map((v, i) => {
        return { label: `${v.first_name} ${v.last_name}`, value: i }
    })
    return {
        applicant_index: {
            type: TYPE.DROPDOWN,
            align: 'right',
            title: 'lang_applicant',
            rules: {
                required: true
            },
            options: applicantOptions
        }
    }
}

const applicantInfo = {
    applicantInfo: {
        type: TYPE.GROUP,
        title: 'lang_applicant_details'
    },
    [FIELD.TITLE]: {
        type: TYPE.DROPDOWN,
        align: 'right',
        title: 'lang_title',
        disable: true,
        rules: {
            required: true
        },
        options: OPTIONS.TITLE
    },
    [FIELD.FIRST_NAME]: {
        type: TYPE.STRING,
        disable: true,
        title: 'lang_first_name',
        rules: {
            required: true
        }
    },
    [FIELD.MIDDLE_NAME]: {
        type: TYPE.STRING,
        disable: true,
        title: 'lang_middle_name'
    },
    [FIELD.LAST_NAME]: {
        type: TYPE.STRING,
        disable: true,
        title: 'lang_last_name',
        rules: {
            required: true
        }
    },
    [FIELD.DOB]: {
        type: TYPE.DATE_PICKER,
        disable: true,
        title: 'lang_date_of_birth',
        titleClass: 'text-normal',
        limit: -18,
        errorText: 'lang_over_18_years_old',
        rules: {
            required: true,
            date: true
        }
    }
}

const verifiedDocuments = {
    verifiedDocuments: {
        type: TYPE.GROUP,
        title: 'lang_verified_documents'
    },
    [FIELD.VERIFIED_DOCUMENTS]: {
        type: TYPE.ARRAY,
        items: {
            type: TYPE.OBJECT,
            properties: {
                [FIELD.GOVERNMENT_ID_TYPE]: {
                    type: TYPE.DROPDOWN,
                    align: 'right',
                    title: 'lang_government_id_type',
                    titleClass: 'text-normal',
                    options: OPTIONS.GOVERNMENT_ID_TYPE,
                    disable: true,
                    condition: {
                        [FIELD.TYPE_OF_DOCUMENT]: DOCUMENT_TYPE.GOVERNMENT_ID
                    },
                    rules: {
                        required: true
                    }
                },
                [FIELD.STATE_OF_ISSUE]: {
                    type: TYPE.DROPDOWN,
                    align: 'right',
                    title: 'lang_state_of_issue',
                    condition: {
                        [FIELD.GOVERNMENT_ID_TYPE]: GOVERNMENT_ID_TYPE.DRIVER_LICENSE,
                        [FIELD.TYPE_OF_DOCUMENT]: DOCUMENT_TYPE.GOVERNMENT_ID
                    },
                    options: OPTIONS.STATE_OF_ISSUE,
                    disable: true,
                    rules: {
                        required: true
                    }
                },
                [FIELD.FIRST_NAME_ON_CARD]: {
                    title: 'lang_first_name_on_card',
                    help: 'lang_government_id_info_helptext',
                    condition: {
                        [FIELD.GOVERNMENT_ID_TYPE]: [GOVERNMENT_ID_TYPE.DRIVER_LICENSE, GOVERNMENT_ID_TYPE.PASSPORT],
                        [FIELD.TYPE_OF_DOCUMENT]: DOCUMENT_TYPE.GOVERNMENT_ID
                    },
                    type: TYPE.STRING,
                    disable: true,
                    align: 'right',
                    rules: {
                        between: ([FIELD.GOVERNMENT_ID_TYPE] === GOVERNMENT_ID_TYPE.PASSPORT) ? '1,31' : '1,20',
                        only_text_and_special_characters: true
                    }

                },
                [FIELD.MIDDLE_NAME_ON_CARD]: {
                    title: 'lang_middle_name_on_card',
                    help: 'lang_government_id_info_helptext',
                    condition: {
                        [FIELD.GOVERNMENT_ID_TYPE]: [GOVERNMENT_ID_TYPE.DRIVER_LICENSE, GOVERNMENT_ID_TYPE.PASSPORT],
                        [FIELD.TYPE_OF_DOCUMENT]: DOCUMENT_TYPE.GOVERNMENT_ID
                    },
                    type: TYPE.STRING,
                    disable: true,
                    align: 'right',
                    rules: {
                        between: ([FIELD.GOVERNMENT_ID_TYPE] === GOVERNMENT_ID_TYPE.PASSPORT) ? '1,31' : '1,20'
                    }

                },
                [FIELD.LAST_NAME_ON_CARD]: {
                    title: 'lang_last_name_on_card',
                    condition: {
                        [FIELD.GOVERNMENT_ID_TYPE]: [GOVERNMENT_ID_TYPE.DRIVER_LICENSE, GOVERNMENT_ID_TYPE.PASSPORT],
                        [FIELD.TYPE_OF_DOCUMENT]: DOCUMENT_TYPE.GOVERNMENT_ID
                    },
                    type: TYPE.STRING,
                    disable: true,
                    align: 'right',
                    rules: {
                        required: function (data) {
                            return data[FIELD.GOVERNMENT_ID_TYPE]
                        },
                        between: ([FIELD.GOVERNMENT_ID_TYPE] === GOVERNMENT_ID_TYPE.PASSPORT) ? '1,31' : '1,40',
                        only_text_and_special_characters: true
                    }

                },
                [FIELD.GOVERNMENT_ID_NUMBER]: {
                    type: TYPE.STRING,
                    title: 'lang_government_id_number',
                    titleClass: 'text-normal',
                    disable: true,
                    condition: {
                        [FIELD.TYPE_OF_DOCUMENT]: DOCUMENT_TYPE.GOVERNMENT_ID
                    },
                    rules: {
                        required: true,
                        passport: true,
                        medicare: true,
                        drive_license: true
                    }
                },
                [FIELD.MEDICARE_NAME_ON_CARD]: {
                    type: TYPE.STRING,
                    title: 'lang_name_on_card',
                    condition: {
                        [FIELD.GOVERNMENT_ID_TYPE]: GOVERNMENT_ID_TYPE.MEDICARE_CARD,
                        [FIELD.TYPE_OF_DOCUMENT]: DOCUMENT_TYPE.GOVERNMENT_ID
                    },
                    disable: true,
                    rules: {
                        required: true
                    }
                },
                [FIELD.INDIVIDUAL_REFERENCE_NUMBER]: {
                    type: TYPE.NUMBER,
                    title: 'lang_individual_reference_number',
                    condition: {
                        [FIELD.GOVERNMENT_ID_TYPE]: GOVERNMENT_ID_TYPE.MEDICARE_CARD,
                        [FIELD.TYPE_OF_DOCUMENT]: DOCUMENT_TYPE.GOVERNMENT_ID
                    },
                    disable: true,
                    rules: {
                        required: true,
                        number: true
                    }
                },
                [FIELD.CARD_COLOUR]: {
                    type: TYPE.DROPDOWN,
                    align: 'right',
                    condition: {
                        [FIELD.GOVERNMENT_ID_TYPE]: GOVERNMENT_ID_TYPE.MEDICARE_CARD,
                        [FIELD.TYPE_OF_DOCUMENT]: DOCUMENT_TYPE.GOVERNMENT_ID
                    },
                    options: OPTIONS.MEDICARE_CARD_COLOUR,
                    disable: true,
                    title: 'lang_card_colour',
                    rules: {
                        required: true
                    }
                },
                [FIELD.CARD_EXPIRY_DATE]: {
                    condition: {
                        [FIELD.GOVERNMENT_ID_TYPE]: GOVERNMENT_ID_TYPE.MEDICARE_CARD,
                        [FIELD.TYPE_OF_DOCUMENT]: DOCUMENT_TYPE.GOVERNMENT_ID
                    },
                    type: TYPE.DATE_PICKER,
                    disable: true,
                    limit: 0,
                    errorText: 'lang_your_card_is_expired',
                    title: 'lang_card_expiry_date',
                    rules: {
                        required: true,
                        date: true
                    }
                },
                [FIELD.DOCUMENT_TYPE]: {
                    title: 'lang_type_of_document',
                    titleClass: 'text-normal',
                    type: TYPE.DROPDOWN,
                    align: 'right',
                    disable: true,
                    options: OPTIONS.DOCUMENT_UPLOAD,
                    condition: {
                        [FIELD.TYPE_OF_DOCUMENT]: DOCUMENT_TYPE.DOCUMENT
                    }
                },
                [FIELD.UPLOADED_DOCUMENT]: {
                    title: 'lang_uploaded_document',
                    disable: true,
                    type: TYPE.FILE,
                    condition: {
                        [FIELD.TYPE_OF_DOCUMENT]: DOCUMENT_TYPE.DOCUMENT
                    }
                }
            }
        }
    }
}

const lockedOutDocuments = {
    lockedOutDocuments: {
        type: TYPE.GROUP,
        title: 'lang_lockedout_documents'
    },
    [FIELD.LOCKEDOUT_DOCUMENTS]: {
        type: TYPE.ARRAY,
        items: {
            type: TYPE.OBJECT,
            properties: {
                [FIELD.GOVERNMENT_ID_TYPE]: {
                    type: TYPE.DROPDOWN,
                    align: 'right',
                    title: 'lang_government_id_type',
                    titleClass: 'text-normal',
                    options: OPTIONS.GOVERNMENT_ID_TYPE,
                    disable: true,
                    rules: {
                        required: true
                    }
                },
                [FIELD.STATE_OF_ISSUE]: {
                    type: TYPE.DROPDOWN,
                    align: 'right',
                    title: 'lang_state_of_issue',
                    condition: {
                        [FIELD.GOVERNMENT_ID_TYPE]: GOVERNMENT_ID_TYPE.DRIVER_LICENSE
                    },
                    options: OPTIONS.STATE_OF_ISSUE,
                    disable: true,
                    rules: {
                        required: true
                    }
                },
                [FIELD.FIRST_NAME_ON_CARD]: {
                    title: 'lang_first_name_on_card',
                    help: 'lang_government_id_info_helptext',
                    condition: {
                        [FIELD.GOVERNMENT_ID_TYPE]: [GOVERNMENT_ID_TYPE.DRIVER_LICENSE, GOVERNMENT_ID_TYPE.PASSPORT]
                    },
                    type: TYPE.STRING,
                    disable: true,
                    align: 'right',
                    rules: {
                        between: ([FIELD.GOVERNMENT_ID_TYPE] === GOVERNMENT_ID_TYPE.PASSPORT) ? '1,31' : '1,20',
                        only_text_and_special_characters: true
                    }

                },
                [FIELD.MIDDLE_NAME_ON_CARD]: {
                    title: 'lang_middle_name_on_card',
                    help: 'lang_government_id_info_helptext',
                    condition: {
                        [FIELD.GOVERNMENT_ID_TYPE]: [GOVERNMENT_ID_TYPE.DRIVER_LICENSE, GOVERNMENT_ID_TYPE.PASSPORT]
                    },
                    type: TYPE.STRING,
                    disable: true,
                    align: 'right',
                    rules: {
                        between: ([FIELD.GOVERNMENT_ID_TYPE] === GOVERNMENT_ID_TYPE.PASSPORT) ? '1,31' : '1,20'
                    }

                },
                [FIELD.LAST_NAME_ON_CARD]: {
                    title: 'lang_last_name_on_card',
                    condition: {
                        [FIELD.GOVERNMENT_ID_TYPE]: [GOVERNMENT_ID_TYPE.DRIVER_LICENSE, GOVERNMENT_ID_TYPE.PASSPORT]
                    },
                    type: TYPE.STRING,
                    disable: true,
                    align: 'right',
                    rules: {
                        required: function (data) {
                            return data[FIELD.GOVERNMENT_ID_TYPE]
                        },
                        between: ([FIELD.GOVERNMENT_ID_TYPE] === GOVERNMENT_ID_TYPE.PASSPORT) ? '1,31' : '1,40',
                        only_text_and_special_characters: true
                    }

                },
                [FIELD.GOVERNMENT_ID_NUMBER]: {
                    type: TYPE.STRING,
                    title: 'lang_government_id_number',
                    titleClass: 'text-normal',
                    disable: true,
                    rules: {
                        required: true,
                        passport: true,
                        medicare: true,
                        drive_license: true
                    }
                },
                [FIELD.MEDICARE_NAME_ON_CARD]: {
                    type: TYPE.STRING,
                    title: 'lang_name_on_card',
                    condition: {
                        [FIELD.GOVERNMENT_ID_TYPE]: GOVERNMENT_ID_TYPE.MEDICARE_CARD
                    },
                    disable: true,
                    rules: {
                        required: true
                    }
                },
                [FIELD.INDIVIDUAL_REFERENCE_NUMBER]: {
                    type: TYPE.NUMBER,
                    title: 'lang_individual_reference_number',
                    condition: {
                        [FIELD.GOVERNMENT_ID_TYPE]: GOVERNMENT_ID_TYPE.MEDICARE_CARD
                    },
                    disable: true,
                    rules: {
                        required: true,
                        number: true
                    }
                },
                [FIELD.CARD_COLOUR]: {
                    type: TYPE.DROPDOWN,
                    align: 'right',
                    condition: {
                        [FIELD.GOVERNMENT_ID_TYPE]: GOVERNMENT_ID_TYPE.MEDICARE_CARD
                    },
                    options: OPTIONS.MEDICARE_CARD_COLOUR,
                    disable: true,
                    title: 'lang_card_colour',
                    rules: {
                        required: true
                    }
                },
                [FIELD.CARD_EXPIRY_DATE]: {
                    condition: {
                        [FIELD.GOVERNMENT_ID_TYPE]: GOVERNMENT_ID_TYPE.MEDICARE_CARD
                    },
                    type: TYPE.DATE_PICKER,
                    disable: true,
                    limit: 0,
                    errorText: 'lang_your_card_is_expired',
                    title: 'lang_card_expiry_date',
                    rules: {
                        required: true,
                        date: true
                    }
                }
            }
        }
    }
}

const pendingDocuments = {
    pendingDocuments: {
        type: TYPE.GROUP,
        title: 'lang_pending_documents'
    },
    [FIELD.PENDING_DOCUMENTS]: {
        type: TYPE.ARRAY,
        items: {
            type: TYPE.OBJECT,
            properties: {
                [FIELD.DOCUMENT_TYPE]: {
                    title: 'lang_type_of_document',
                    titleClass: 'text-normal',
                    type: TYPE.DROPDOWN,
                    align: 'right',
                    disable: true,
                    options: OPTIONS.DOCUMENT_UPLOAD,
                    condition: {
                        [FIELD.TYPE_OF_DOCUMENT]: DOCUMENT_TYPE.DOCUMENT
                    }
                },
                [FIELD.UPLOADED_DOCUMENT]: {
                    title: 'lang_uploaded_document',
                    disable: true,
                    type: TYPE.FILE,
                    condition: {
                        [FIELD.TYPE_OF_DOCUMENT]: DOCUMENT_TYPE.DOCUMENT
                    }
                }
            }
        }
    }
}

const updateDocumentNoPending = (data) => {
    const existedDocuments = data[FIELD.EXISTED_DOCUMENTS] || {}
    const isDisableChooseGovernmentType = data[FIELD.HAVE_TO_EDIT] === 'edit'
    const chooseTypeDocument = data[FIELD.HAVE_TO_EDIT] === 'edit' ? {} : {
        [FIELD.TYPE_OF_DOCUMENT]: {
            title: 'lang_type_of_verification_document',
            type: TYPE.DROPDOWN,
            align: 'right',
            options: OPTIONS.TYPE_OF_DOCUMENT
        }
    }
    return {
        updateDocumentNoPending: {
            type: TYPE.GROUP,
            title: data[FIELD.HAVE_TO_EDIT] === 'edit' ? 'lang_edit_verifications_documents' : 'lang_add_verifications_documents'
        },
        [FIELD.GOVERNMENT_ID]: {
            type: TYPE.ARRAY,
            items: {
                type: TYPE.OBJECT,
                properties: {
                    ...chooseTypeDocument,
                    [FIELD.GOVERNMENT_ID_TYPE]: {
                        type: TYPE.DROPDOWN,
                        align: 'right',
                        disable: isDisableChooseGovernmentType,
                        title: 'lang_government_id_type',
                        titleClass: 'text-normal',
                        options: OPTIONS.GOVERNMENT_ID_TYPE.filter(e => !existedDocuments[e.value]),
                        rules: {
                            required: true
                        },
                        condition: {
                            [FIELD.TYPE_OF_DOCUMENT]: DOCUMENT_TYPE.GOVERNMENT_ID
                        }
                    },
                    [FIELD.STATE_OF_ISSUE]: {
                        type: TYPE.DROPDOWN,
                        align: 'right',
                        title: 'lang_state_of_issue',
                        condition: {
                            [FIELD.GOVERNMENT_ID_TYPE]: GOVERNMENT_ID_TYPE.DRIVER_LICENSE,
                            [FIELD.TYPE_OF_DOCUMENT]: DOCUMENT_TYPE.GOVERNMENT_ID
                        },
                        options: OPTIONS.STATE_OF_ISSUE,
                        rules: {
                            required: true
                        }
                    },
                    [FIELD.FIRST_NAME_ON_CARD]: {
                        title: 'lang_first_name_on_card',
                        help: 'lang_government_id_info_helptext',
                        condition: {
                            [FIELD.GOVERNMENT_ID_TYPE]: [GOVERNMENT_ID_TYPE.DRIVER_LICENSE, GOVERNMENT_ID_TYPE.PASSPORT],
                            [FIELD.TYPE_OF_DOCUMENT]: DOCUMENT_TYPE.GOVERNMENT_ID
                        },
                        type: TYPE.STRING,
                        align: 'right',
                        rules: {
                            only_text_and_special_characters: true,
                            first_name_middle_name_lenght: (data) => {
                                if (data[FIELD.GOVERNMENT_ID_TYPE] === GOVERNMENT_ID_TYPE.PASSPORT) {
                                    return 30
                                } else return ''
                            },
                            between: (data) => {
                                if (data[FIELD.GOVERNMENT_ID_TYPE] === GOVERNMENT_ID_TYPE.DRIVER_LICENSE) {
                                    return '1,20'
                                } else return ''
                            }
                        }
                    },
                    [FIELD.MIDDLE_NAME_ON_CARD]: {
                        title: 'lang_middle_name_on_card',
                        help: 'lang_government_id_info_helptext',
                        condition: {
                            [FIELD.GOVERNMENT_ID_TYPE]: [GOVERNMENT_ID_TYPE.DRIVER_LICENSE, GOVERNMENT_ID_TYPE.PASSPORT],
                            [FIELD.TYPE_OF_DOCUMENT]: DOCUMENT_TYPE.GOVERNMENT_ID
                        },
                        type: TYPE.STRING,
                        align: 'right',
                        rules: {
                            only_text_and_special_characters: true,
                            first_name_middle_name_lenght: (data) => {
                                if (data[FIELD.GOVERNMENT_ID_TYPE] === GOVERNMENT_ID_TYPE.PASSPORT) {
                                    return 30
                                } else return ''
                            },
                            between: (data) => {
                                if (data[FIELD.GOVERNMENT_ID_TYPE] === GOVERNMENT_ID_TYPE.DRIVER_LICENSE) {
                                    return '1,20'
                                } else return ''
                            }
                        }
                    },
                    [FIELD.LAST_NAME_ON_CARD]: {
                        title: 'lang_last_name_on_card',
                        condition: {
                            [FIELD.GOVERNMENT_ID_TYPE]: [GOVERNMENT_ID_TYPE.DRIVER_LICENSE, GOVERNMENT_ID_TYPE.PASSPORT],
                            [FIELD.TYPE_OF_DOCUMENT]: DOCUMENT_TYPE.GOVERNMENT_ID
                        },
                        type: TYPE.STRING,
                        align: 'right',
                        rules: {
                            required: function (data) {
                                return data[FIELD.GOVERNMENT_ID_TYPE]
                            },
                            between: (data) => {
                                if (data[FIELD.GOVERNMENT_ID_TYPE] === GOVERNMENT_ID_TYPE.PASSPORT) {
                                    return '1,31'
                                } else if (data[FIELD.GOVERNMENT_ID_TYPE] === GOVERNMENT_ID_TYPE.DRIVER_LICENSE) {
                                    return '1,40'
                                } else return ''
                            },
                            only_text_and_special_characters: true
                        }
                    },
                    [FIELD.GOVERNMENT_ID_NUMBER]: {
                        type: TYPE.STRING,
                        title: 'lang_government_id_number',
                        titleClass: 'text-normal',
                        rules: {
                            between: (data) => {
                                if (data[FIELD.GOVERNMENT_ID_TYPE] === GOVERNMENT_ID_TYPE.PASSPORT) {
                                    return '8,9'
                                } else if (data[FIELD.GOVERNMENT_ID_TYPE] === GOVERNMENT_ID_TYPE.DRIVER_LICENSE) {
                                    return '1,10'
                                } else return '1,10'
                            },
                            required: function (data) {
                                return data[FIELD.GOVERNMENT_ID_TYPE]
                            },
                            passport: true,
                            medicare: true,
                            drive_license: true
                        },
                        condition: {
                            [FIELD.TYPE_OF_DOCUMENT]: DOCUMENT_TYPE.GOVERNMENT_ID
                        }
                    },
                    [FIELD.MEDICARE_NAME_ON_CARD]: {
                        type: TYPE.STRING,
                        title: 'lang_name_on_card',
                        condition: {
                            [FIELD.GOVERNMENT_ID_TYPE]: GOVERNMENT_ID_TYPE.MEDICARE_CARD,
                            [FIELD.TYPE_OF_DOCUMENT]: DOCUMENT_TYPE.GOVERNMENT_ID
                        },
                        rules: {
                            required: true
                        }
                    },
                    [FIELD.INDIVIDUAL_REFERENCE_NUMBER]: {
                        type: TYPE.NUMBER,
                        title: 'lang_individual_reference_number',
                        condition: {
                            [FIELD.GOVERNMENT_ID_TYPE]: GOVERNMENT_ID_TYPE.MEDICARE_CARD,
                            [FIELD.TYPE_OF_DOCUMENT]: DOCUMENT_TYPE.GOVERNMENT_ID
                        },
                        rules: {
                            required: true,
                            number: true
                        }
                    },
                    [FIELD.CARD_COLOUR]: {
                        condition: {
                            [FIELD.GOVERNMENT_ID_TYPE]: GOVERNMENT_ID_TYPE.MEDICARE_CARD,
                            [FIELD.TYPE_OF_DOCUMENT]: DOCUMENT_TYPE.GOVERNMENT_ID
                        },
                        options: OPTIONS.MEDICARE_CARD_COLOUR,
                        type: TYPE.DROPDOWN,
                        align: 'right',
                        title: 'lang_card_colour',
                        rules: {
                            required: true
                        }
                    },
                    [FIELD.CARD_EXPIRY_DATE]: {
                        condition: {
                            [FIELD.GOVERNMENT_ID_TYPE]: GOVERNMENT_ID_TYPE.MEDICARE_CARD,
                            [FIELD.TYPE_OF_DOCUMENT]: DOCUMENT_TYPE.GOVERNMENT_ID
                        },
                        limit: 0,
                        type: TYPE.DATE_PICKER,
                        errorText: 'lang_your_card_is_expired',
                        title: 'lang_card_expiry_date',
                        rules: {
                            required: true,
                            date: true
                        }
                    },
                    [FIELD.DOCUMENT_TYPE]: {
                        title: 'lang_type_of_document',
                        titleClass: 'text-normal',
                        type: TYPE.DROPDOWN,
                        align: 'right',
                        options: OPTIONS.DOCUMENT_UPLOAD.filter(e => !existedDocuments[e.value]),
                        condition: {
                            [FIELD.TYPE_OF_DOCUMENT]: DOCUMENT_TYPE.DOCUMENT
                        }
                    },
                    [FIELD.DOCUMENT_DATA]: {
                        title: 'lang_select_document_to_upload',
                        titleClass: 'text-normal',
                        help: 'lang_select_document_to_upload_helptext',
                        type: TYPE.INPUT_FILE,
                        rules: {
                            required: function (data) {
                                return data[FIELD.DOCUMENT_TYPE]
                            }
                        },
                        condition: {
                            [FIELD.TYPE_OF_DOCUMENT]: DOCUMENT_TYPE.DOCUMENT
                        }
                    },
                    [FIELD.PASSPORT_PHOTO]: isDisableChooseGovernmentType ? null : {
                        title: 'lang_upload_photo_of_passport',
                        align: 'right',
                        placeholder: 'Select File (PNG, JPG or PDF)',
                        condition: {
                            [FIELD.GOVERNMENT_ID_TYPE]: GOVERNMENT_ID_TYPE.PASSPORT,
                            [FIELD.TYPE_OF_DOCUMENT]: DOCUMENT_TYPE.GOVERNMENT_ID
                        },
                        type: TYPE.INPUT_FILE,
                        rules: {
                            maxSize: 25
                        }
                    }
                }
            }
        }
    }
}

const updateDocumentPending = (data) => {
    const existedDocuments = data[FIELD.EXISTED_DOCUMENTS] || {}
    const isDisableChooseGovernmentType = data[FIELD.HAVE_TO_EDIT] === 'edit'
    return {
        updateDocumentPending: {
            type: TYPE.GROUP,
            title: data[FIELD.HAVE_TO_EDIT] === 'edit' ? 'lang_edit_verifications_documents' : 'lang_add_verifications_documents'
        },
        [FIELD.GOVERNMENT_ID]: {
            type: TYPE.ARRAY,
            items: {
                type: TYPE.OBJECT,
                properties: {
                    [FIELD.GOVERNMENT_ID_TYPE]: {
                        type: TYPE.DROPDOWN,
                        align: 'right',
                        title: 'lang_government_id_type',
                        titleClass: 'text-normal',
                        disable: isDisableChooseGovernmentType,
                        options: OPTIONS.GOVERNMENT_ID_TYPE.filter(e => !existedDocuments[e.value]),
                        rules: {
                            required: true
                        }
                    },
                    [FIELD.STATE_OF_ISSUE]: {
                        type: TYPE.DROPDOWN,
                        align: 'right',
                        title: 'lang_state_of_issue',
                        condition: {
                            [FIELD.GOVERNMENT_ID_TYPE]: GOVERNMENT_ID_TYPE.DRIVER_LICENSE
                        },
                        options: OPTIONS.STATE_OF_ISSUE,
                        rules: {
                            required: true
                        }
                    },
                    [FIELD.FIRST_NAME_ON_CARD]: {
                        title: 'lang_first_name_on_card',
                        help: 'lang_government_id_info_helptext',
                        condition: {
                            [FIELD.GOVERNMENT_ID_TYPE]: [GOVERNMENT_ID_TYPE.DRIVER_LICENSE, GOVERNMENT_ID_TYPE.PASSPORT]
                        },
                        type: TYPE.STRING,
                        align: 'right',
                        rules: {
                            only_text_and_special_characters: true,
                            first_name_middle_name_lenght: (data) => {
                                if (data[FIELD.GOVERNMENT_ID_TYPE] === GOVERNMENT_ID_TYPE.PASSPORT) {
                                    return 30
                                } else return ''
                            },
                            between: (data) => {
                                if (data[FIELD.GOVERNMENT_ID_TYPE] === GOVERNMENT_ID_TYPE.DRIVER_LICENSE) {
                                    return '1,20'
                                } else return ''
                            }
                        }
                    },
                    [FIELD.MIDDLE_NAME_ON_CARD]: {
                        title: 'lang_middle_name_on_card',
                        help: 'lang_government_id_info_helptext',
                        condition: {
                            [FIELD.GOVERNMENT_ID_TYPE]: [GOVERNMENT_ID_TYPE.DRIVER_LICENSE, GOVERNMENT_ID_TYPE.PASSPORT]
                        },
                        type: TYPE.STRING,
                        align: 'right',
                        rules: {
                            only_text_and_special_characters: true,
                            first_name_middle_name_lenght: (data) => {
                                if (data[FIELD.GOVERNMENT_ID_TYPE] === GOVERNMENT_ID_TYPE.PASSPORT) {
                                    return 30
                                } else return ''
                            },
                            between: (data) => {
                                if (data[FIELD.GOVERNMENT_ID_TYPE] === GOVERNMENT_ID_TYPE.DRIVER_LICENSE) {
                                    return '1,20'
                                } else return ''
                            }
                        }
                    },
                    [FIELD.LAST_NAME_ON_CARD]: {
                        title: 'lang_last_name_on_card',
                        condition: {
                            [FIELD.GOVERNMENT_ID_TYPE]: [GOVERNMENT_ID_TYPE.DRIVER_LICENSE, GOVERNMENT_ID_TYPE.PASSPORT]
                        },
                        type: TYPE.STRING,
                        align: 'right',
                        rules: {
                            required: function (data) {
                                return data[FIELD.GOVERNMENT_ID_TYPE]
                            },
                            between: (data) => {
                                if (data[FIELD.GOVERNMENT_ID_TYPE] === GOVERNMENT_ID_TYPE.PASSPORT) {
                                    return '1,31'
                                } else if (data[FIELD.GOVERNMENT_ID_TYPE] === GOVERNMENT_ID_TYPE.DRIVER_LICENSE) {
                                    return '1,40'
                                } else return ''
                            },
                            only_text_and_special_characters: true
                        }
                    },
                    [FIELD.GOVERNMENT_ID_NUMBER]: {
                        type: TYPE.STRING,
                        title: 'lang_government_id_number',
                        titleClass: 'text-normal',
                        rules: {
                            between: (data) => {
                                if (data[FIELD.GOVERNMENT_ID_TYPE] === GOVERNMENT_ID_TYPE.PASSPORT) {
                                    return '8,9'
                                } else if (data[FIELD.GOVERNMENT_ID_TYPE] === GOVERNMENT_ID_TYPE.DRIVER_LICENSE) {
                                    return '1,10'
                                } else return '1,10'
                            },
                            required: function (data) {
                                return data[FIELD.GOVERNMENT_ID_TYPE]
                            },
                            passport: true,
                            medicare: true,
                            drive_license: true
                        }
                    },
                    [FIELD.MEDICARE_NAME_ON_CARD]: {
                        type: TYPE.STRING,
                        title: 'lang_name_on_card',
                        condition: {
                            [FIELD.GOVERNMENT_ID_TYPE]: GOVERNMENT_ID_TYPE.MEDICARE_CARD
                        },
                        rules: {
                            required: true,
                            between: '1,27',
                            special_characters: true
                        }
                    },
                    [FIELD.INDIVIDUAL_REFERENCE_NUMBER]: {
                        type: TYPE.NUMBER,
                        title: 'lang_individual_reference_number',
                        condition: {
                            [FIELD.GOVERNMENT_ID_TYPE]: GOVERNMENT_ID_TYPE.MEDICARE_CARD
                        },
                        rules: {
                            required: true,
                            number: true,
                            max: 1
                        }
                    },
                    [FIELD.CARD_COLOUR]: {
                        condition: {
                            [FIELD.GOVERNMENT_ID_TYPE]: GOVERNMENT_ID_TYPE.MEDICARE_CARD
                        },
                        options: OPTIONS.MEDICARE_CARD_COLOUR,
                        type: TYPE.DROPDOWN,
                        align: 'right',
                        title: 'lang_card_colour',
                        rules: {
                            required: true
                        }
                    },
                    [FIELD.CARD_EXPIRY_DATE]: {
                        condition: {
                            [FIELD.GOVERNMENT_ID_TYPE]: GOVERNMENT_ID_TYPE.MEDICARE_CARD
                        },
                        limit: 0,
                        type: TYPE.DATE_PICKER,
                        errorText: 'lang_your_card_is_expired',
                        title: 'lang_card_expiry_date',
                        rules: {
                            required: true,
                            date: true
                        }
                    },
                    [FIELD.PASSPORT_PHOTO]: isDisableChooseGovernmentType ? null : {
                        title: 'lang_upload_photo_of_passport',
                        align: 'right',
                        placeholder: 'Select File (PNG, JPG or PDF)',
                        condition: {
                            [FIELD.GOVERNMENT_ID_TYPE]: GOVERNMENT_ID_TYPE.PASSPORT,
                            [FIELD.TYPE_OF_DOCUMENT]: DOCUMENT_TYPE.GOVERNMENT_ID
                        },
                        type: TYPE.INPUT_FILE,
                        rules: {
                            maxSize: 25
                        }
                    }
                }
            }
        }
    }
}

const MAPPING_GOVERMENT_TYPE = {
    DRIVER_LICENSE: 'driver license',
    MEDICARE_CARD: 'medicare card',
    PASSPORT: 'passport'
}

export class AddGovernmentID extends React.Component {
    constructor(props) {
        super(props)
        // this.listData = FAKE_DATA || []
        this.listData = clone(props.listData || [])
        this.applicantChoice = 0
        this.getListButton(0)
        this.errorCount = 0
        this.state = {
            index: 0,
            isWaiting: false
        }
        this.isConnected = dataStorage.connected;
    }
    getSchema = (data, listData) => {
        return {
            type: TYPE.OBJECT,
            properties: {
                ...this.props.isAccountDetails ? {} : applicantDropdown(listData),
                ...applicantInfo,
                ...(data[FIELD.VERIFIED_DOCUMENTS] && data[FIELD.VERIFIED_DOCUMENTS].length ? verifiedDocuments : {}),
                ...(data[FIELD.LOCKEDOUT_DOCUMENTS] && data[FIELD.LOCKEDOUT_DOCUMENTS].length ? lockedOutDocuments : {}),
                ...(data[FIELD.PENDING_DOCUMENTS] && data[FIELD.PENDING_DOCUMENTS].length && !this.props.isAccountDetails ? pendingDocuments : {}),
                ...((data[FIELD.PENDING_DOCUMENTS] && data[FIELD.PENDING_DOCUMENTS].length) || this.props.isAccountDetails ? updateDocumentPending(data) : updateDocumentNoPending(data))
            }
        }
    }

    getListButton(index) {
        this.listButton = [BUTTON.SUBMIT, BUTTON.CANCEL]
    }

    changeConnection = (isConnected) => {
        if (isConnected !== this.isConnected) {
            this.isConnected = isConnected;
            if (isConnected) this.refBtn && this.refBtn.classList.remove(s.disableBtn)
            else this.refBtn && this.refBtn.classList.add(s.disableBtn)
        }
    }

    componentDidMount() {
        addEventListener(EVENTNAME.connectionChanged, this.changeConnection)
        const data = this.listData[this.state.index] || {}
        const structure = this.getSchema(data, this.listData);
        this.setSchema && this.setSchema(structure)
        this.setData && this.setData(data)
        this.setEditMode && this.setEditMode(true)
    }

    onChange = (data, errorCount) => {
        if (data.applicant_index !== null && data.applicant_index !== undefined && data.applicant_index !== this.applicantChoice) {
            this.applicantChoice = data.applicant_index;
            let dataNew = this.listData[data.applicant_index]
            dataNew.applicant_index = data.applicant_index;
            let structure = this.getSchema(dataNew, this.listData)
            this.setSchema(structure)
            this.setData(dataNew)
            this.forceUpdate()
        }
        if (data.government_id[0].type !== this.oldType || data.government_id[0].type_of_document !== this.oldType_of_document) this.autoScroll()
        this.oldType = data.government_id[0].type
        this.oldType_of_document = data.government_id[0].type_of_document
        this.errorCount = errorCount
    }
    autoScroll() {
        if (this._scroll) {
            if (typeof this.oldHeight === 'number') {
                const diff = this.oldHeight - (this._scroll && this._scroll.children && this._scroll.children[4].offsetHeight)
                this._scroll.scrollTop = this._scroll.scrollTop - diff
            }
            this.oldHeight = this._scroll && this._scroll.children && this._scroll.children[4].offsetHeight
        }
    }

    renderTopInfo() {
        return (
            <React.Fragment>
                <div className={s.labelBgContainer}>
                    <div className={s.mainTitleBg + ' ' + 'text-capitalize'}><Lang>lang_important</Lang></div>
                    <div className={s.subTitleBg}><Lang>lang_add_government_id_sub_title</Lang></div>
                </div>
                <div className={s.label}><Lang>lang_please_call_support</Lang></div>
                <div className={s.label}> <span className={s.requireSymbol}>*</span><span className='text-capitalize'>&nbsp;<Lang>lang_require_symbol</Lang></span></div>
                {this.listData[this.applicantChoice].pending_documents.length
                    ? <div style={{ display: 'flex', alignItems: 'center' }} className={s.label}> <SvgIcon style={{ width: '16px', paddingRight: '8px' }} path={path.mdiAlert} fill='var(--semantic-warning)' />Thank you for submitting your {UPLOAD_TYPE[this.listData[this.applicantChoice].pending_documents[0].document_type].toCapitalize()} . It is being review manually by our team. Please check back later!  </div>
                    : null
                }
            </React.Fragment>
        )
    }

    renderForm() {
        return <Form
            onChange={this.onChange}
            fn={fn => {
                this.setData = fn.setData;
                this.getData = fn.getData;
                this.resetData = fn.resetData;
                this.clearData = fn.clearData;
                this.setEditMode = fn.setEditMode
                this.setSchema = fn.setSchema;
                this.getSchemaForm = fn.getSchema;
                this.getDefaultData = fn.getDefaultData
            }}
            marginForm={true}
            noDispatch={true}
        />
    }
    showError = (err, color = '--semantic-danger', cb) => {
        this.errorRef && this.errorRef.showError && this.errorRef.showError(err, color)
        this.hiddenError(cb)
    }

    hiddenError = (cb) => {
        setTimeout(() => {
            this.errorRef && this.errorRef.hideError && this.errorRef.hideError()
            cb && cb()
        }, 4000)
    }

    renderHeader() {
        return (
            <React.Fragment>
                <div className={s.header}>
                    <div className={s.title + ' ' + 'showTitle text-capitalize'}>{this.props.isAccountDetails ? <Lang>lang_account_details</Lang> : <Lang>lang_open_trading_account</Lang>}</div>
                    <div className={s.icon} onClick={() => this.props.close()}><SvgIcon path={path.mdiClose} /></div>
                </div>
                <Error ref={ref => this.errorRef = ref} />
            </React.Fragment>
        )
    }

    onBtnClick = (btn) => {
        switch (btn) {
            case BUTTON.SUBMIT:
                this.onSubmit()
                break
            case BUTTON.CANCEL:
            default: this.props.close()
                break
        }
    }

    onSubmit = () => {
        this.setState({ isWaiting: true }, () => {
            if (this.getData()) {
                const equixId = this.listData[0][FIELD.EQUIX_ID]
                const url = getOpeningAccountUrl(`?equix_id=${equixId}`)
                let dataToPut = clone(this.listData[this.applicantChoice])

                const putDataObj = {
                    [FIELD.APPLICANT_ID]: dataToPut[FIELD.APPLICANT_ID],
                    [FIELD.VERIFICATION_ID]: dataToPut[FIELD.VERIFICATION_ID]
                }
                delete dataToPut[FIELD.GOVERNMENT_ID][0][FIELD.EKYC_GOVID_STATUS]
                delete dataToPut[FIELD.GOVERNMENT_ID][0][FIELD.EKYC_OVERALL_STATUS]
                delete dataToPut[FIELD.GOVERNMENT_ID][0][FIELD.DOCUMENT_NAME]
                if (dataToPut[FIELD.GOVERNMENT_ID][0][FIELD.TYPE_OF_DOCUMENT] === DOCUMENT_TYPE.DOCUMENT) {
                    delete dataToPut[FIELD.GOVERNMENT_ID][0][FIELD.TYPE_OF_DOCUMENT]
                    delete dataToPut[FIELD.GOVERNMENT_ID][0].medicare_card_colour
                    delete dataToPut[FIELD.GOVERNMENT_ID][0].medicare_card_expiry_date
                    delete dataToPut[FIELD.GOVERNMENT_ID][0].medicare_individual_reference_number
                    delete dataToPut[FIELD.GOVERNMENT_ID][0].medicare_name_on_card
                    delete dataToPut[FIELD.GOVERNMENT_ID][0].state_of_issue
                    delete dataToPut[FIELD.GOVERNMENT_ID][0].number
                    putDataObj[FIELD.UPLOADED_DOCUMENTS] = dataToPut[FIELD.GOVERNMENT_ID]
                } else {
                    delete dataToPut[FIELD.GOVERNMENT_ID][0].document_type
                    delete dataToPut[FIELD.GOVERNMENT_ID][0].document_data
                    if (dataToPut[FIELD.GOVERNMENT_ID][0].type === GOVERNMENT_ID_TYPE.PASSPORT) {
                        delete dataToPut[FIELD.GOVERNMENT_ID][0].medicare_card_colour
                        delete dataToPut[FIELD.GOVERNMENT_ID][0].medicare_card_expiry_date
                        delete dataToPut[FIELD.GOVERNMENT_ID][0].medicare_individual_reference_number
                        delete dataToPut[FIELD.GOVERNMENT_ID][0].medicare_name_on_card
                        delete dataToPut[FIELD.GOVERNMENT_ID][0].state_of_issue
                        if (dataToPut[FIELD.GOVERNMENT_ID][0].PASSPORT_PHOTOdocument_name) delete dataToPut[FIELD.GOVERNMENT_ID][0].PASSPORT_PHOTOdocument_name
                    } else if (dataToPut[FIELD.GOVERNMENT_ID][0].type === GOVERNMENT_ID_TYPE.DRIVER_LICENSE) {
                        delete dataToPut[FIELD.GOVERNMENT_ID][0].medicare_card_colour
                        delete dataToPut[FIELD.GOVERNMENT_ID][0].medicare_card_expiry_date
                        delete dataToPut[FIELD.GOVERNMENT_ID][0].medicare_individual_reference_number
                        delete dataToPut[FIELD.GOVERNMENT_ID][0].medicare_name_on_card
                        // if (dataToPut[FIELD.GOVERNMENT_ID][0].DRIVER_LICENSE_PHOTO_BACKdocument_name) {
                        //     delete dataToPut[FIELD.GOVERNMENT_ID][0].DRIVER_LICENSE_PHOTO_BACKdocument_name
                        //     delete dataToPut[FIELD.GOVERNMENT_ID][0].DRIVER_LICENSE_PHOTO_FRONTdocument_name
                        // }
                        // if (dataToPut[FIELD.GOVERNMENT_ID][0].DRIVER_LICENSE_PHOTO_BACK === null) delete dataToPut[FIELD.GOVERNMENT_ID][0].DRIVER_LICENSE_PHOTO_BACK
                        // if (dataToPut[FIELD.GOVERNMENT_ID][0].DRIVER_LICENSE_PHOTO_FRONT === null) delete dataToPut[FIELD.GOVERNMENT_ID][0].DRIVER_LICENSE_PHOTO_FRONT
                    } else if (dataToPut[FIELD.GOVERNMENT_ID][0].type === GOVERNMENT_ID_TYPE.MEDICARE_CARD) {
                        delete dataToPut[FIELD.GOVERNMENT_ID][0].state_of_issue
                    }
                    delete dataToPut[FIELD.GOVERNMENT_ID][0][FIELD.TYPE_OF_DOCUMENT]
                    putDataObj[FIELD.GOVERNMENT_ID] = dataToPut[FIELD.GOVERNMENT_ID]
                }
                // if (dataToPut[FIELD.GOVERNMENT_ID][0][FIELD.DRIVER_LICENSE_PHOTO_BACK] || dataToPut[FIELD.GOVERNMENT_ID][0][FIELD.DRIVER_LICENSE_PHOTO_FRONT]) {
                //     putDataObj[FIELD.UPLOADED_DOCUMENTS] = []
                //     let objPhoto = {}
                //     objPhoto.document_type = 'DRIVER_LICENSE_PHOTO'
                //     const img1 = new Image()
                //     const img2 = new Image()
                //     var canvas = document.createElement('canvas')
                //     canvas.id = 'upload_driver_license'
                //     canvas.width = 630
                //     canvas.height = 220
                //     var ctx = canvas.getContext('2d')
                //     img1.onload = () => {
                //         ctx.drawImage(img1, 10, 10, 300, 200)
                //     }
                //     img1.src = dataToPut[FIELD.GOVERNMENT_ID][0].DRIVER_LICENSE_PHOTO_FRONT
                //     img2.onload = () => {
                //         ctx.drawImage(img2, 320, 10, 300, 200)
                //     }
                //     img2.src = dataToPut[FIELD.GOVERNMENT_ID][0].DRIVER_LICENSE_PHOTO_BACK
                //     setTimeout(() => {
                //         var imgData = canvas.toDataURL('image/jpeg', 1.0);
                //         var pdf = new JsPDF();
                //         pdf.addImage(imgData, 'JPEG', 0, 0);
                //         const arrPDF = pdf.output('arraybuffer')
                //         var binary = '';
                //         var bytes = new Uint8Array(arrPDF);
                //         var len = bytes.byteLength;
                //         for (var i = 0; i < len; i++) {
                //             binary += String.fromCharCode(bytes[i]);
                //         }
                //         objPhoto.document_data = 'data:application/pdf;base64,' + window.btoa(binary)
                //         if (objPhoto.document_datadocument_name) delete objPhoto.document_datadocument_name
                //         putDataObj[FIELD.UPLOADED_DOCUMENTS].push(objPhoto)
                //         delete dataToPut[FIELD.GOVERNMENT_ID][0].DRIVER_LICENSE_PHOTO_FRONT
                //         delete dataToPut[FIELD.GOVERNMENT_ID][0].DRIVER_LICENSE_PHOTO_BACK
                //     }, 500);
                // }

                if (putDataObj[FIELD.UPLOADED_DOCUMENTS] && putDataObj[FIELD.UPLOADED_DOCUMENTS][0].document_datadocument_name) delete putDataObj[FIELD.UPLOADED_DOCUMENTS][0].document_datadocument_name
                let obj = {
                    [FIELD.APPLICANT_DETAILS]: [putDataObj]
                }
                if ((putDataObj.government_id && putDataObj.government_id[0].type) || (putDataObj.uploaded_documents && putDataObj.uploaded_documents[0].document_type)) {
                    setTimeout(() => {
                        obj = { [FIELD.APPLICANT_DETAILS]: [putDataObj] }
                        putData(url, obj).then(res => {
                            this.handleAfterPut(res)
                            // this.props.close()
                        }).catch(error => {
                            this.showError('Failed to update Government ID')
                            // this.hiddenError()
                            this.setState({ isWaiting: false })
                            console.error('onSubmit addGovernmentId fail: ', error)
                        })
                    }, 501)
                } else {
                    this.showError('Failed to update Government ID')
                    // this.hiddenError()
                    this.setState({ isWaiting: false })
                }
            } else {
                this.showError('Failed to update Government ID')
                // this.hiddenError()
                this.setState({ isWaiting: false })
            }
        })
    }
    handleAfterPut = res => {
        let data = res.data;
        if (data.ekyc_status) {
            let dataEkycStatus = data.ekyc_status[0] || {}
            if (['EKYC_MORE_INFO', 'EKYC_IN_PROGRESS'].includes(data.account_status)) {
                if (dataEkycStatus.ekyc_overall_status === 'EKYC_IN_PROGRESS') {
                    if (dataEkycStatus.ekyc_document_status) {
                        this.hiddenError(this.props.close)
                    } else if (dataEkycStatus.ekyc_govid_status) {
                        if (dataEkycStatus.ekyc_govid_status === 'EKYC_IN_PROGRESS') {
                            let dataNew = this.listData.find(x => x.applicant_id === dataEkycStatus.applicant_id)
                            this.showError(`Your ${MAPPING_GOVERMENT_TYPE[dataNew.government_id[0].type]} number is invalid. Please try again.`, '--semantic-danger')
                            dataNew.have_to_edit = 'edit'
                            const structure = this.getSchema(dataNew, this.listData);
                            this.setSchema && this.setSchema(structure)
                            this.setData && this.setData(dataNew)
                            this.setState({ isWaiting: false })
                        } else if (dataEkycStatus.ekyc_govid_status === 'EKYC_VERIFIED') {
                            this.showError('Your information needs further review. Please submit another document.', '--semantic-success')
                            let dataNew = this.listData.find(x => x.applicant_id === dataEkycStatus.applicant_id)
                            dataNew.verified_documents.push(dataNew.government_id)
                            dataNew.verified_documents = dataNew.verified_documents.flat()
                            dataNew.have_to_edit = 'add'
                            dataNew.existed_document[dataNew.government_id[0].type] = true
                            dataNew.government_id = [{}]
                            const structure = this.getSchema(dataNew, this.listData);
                            this.setSchema && this.setSchema(structure)
                            this.setData && this.setData(dataNew)
                            this.setState({ isWaiting: false })
                        } else if (dataEkycStatus.ekyc_govid_status === 'EKYC_LOCKED_OUT') {
                            let dataNew = this.listData.find(x => x.applicant_id === dataEkycStatus.applicant_id)
                            this.showError(`Your are locked out of the identity verification process due to 3 invalid ${MAPPING_GOVERMENT_TYPE[dataNew.government_id[0].type]} number submissions. Please try to verfify with another government issued ID.`, '--semantic-warning')
                            dataNew.have_to_edit = 'add'
                            dataNew.existed_document[dataNew.government_id[0].type] = true
                            dataNew.lockedout_documents.push(dataNew.government_id)
                            dataNew.lockedout_documents = dataNew.lockedout_documents.flat()
                            dataNew.government_id = [{}]
                            const structure = this.getSchema(dataNew, this.listData);
                            this.setSchema && this.setSchema(structure)
                            this.setData && this.setData(dataNew)
                            this.setState({ isWaiting: false })
                        } else {
                            this.showError('Your information needs further review.', '--semantic-success', this.props.close)
                        }
                    }
                } else {
                    if (this.props.isAccountDetails) {
                        if (dataEkycStatus.ekyc_overall_status === 'EKYC_LOCKED_OUT') this.showError(`Your are locked out of the identity verification process due to 5 invalid government ID submissions. Please contact customer service for support.`, '--semantic-danger', this.props.close)
                        else this.showError(`You have successfully pass KYC.`, '--semantic-success', this.props.close)
                    } else {
                        if (dataEkycStatus.ekyc_overall_status === 'EKYC_LOCKED_OUT') this.showError(`Your are locked out of the identity verification process due to 5 invalid government ID submissions. Please contact customer service for support.`, '--semantic-danger')
                        else this.showError(`You have successfully pass KYC.`, '--semantic-success')
                        this.listData = this.listData.filter(x => x.applicant_id !== dataEkycStatus.applicant_id)
                        this.applicantChoice = 0
                        const dataNew = this.listData[0] || {}
                        dataNew.applicant_index = 0
                        const structure = this.getSchema(dataNew, this.listData);
                        this.setSchema && this.setSchema(structure)
                        this.setData && this.setData(dataNew)
                        this.setState({ isWaiting: false })
                    }
                }
            } else if (data.account_status === 'EKYC_LOCKED_OUT') {
                this.showError(`Your are locked out of the identity verification process due to 5 invalid government ID submissions. Please contact customer service for support.`, '--semantic-warning', this.props.close)
            } else {
                this.showError(`You have successfully pass KYC.`, '--semantic-success', this.props.close)
            }
        } else {
            this.showError('Your information needs further review.', '--semantic-success', this.props.close)
        }
    }

    renderFooter() {
        return <div className={`${s.buttonGroup} ${this.isConnected ? '' : s.disableBtn}`} ref={ref => this.refBtn = ref}>
            {
                [BUTTON.SUBMIT, BUTTON.CANCEL].map((e, i) => {
                    return <Button type={[BUTTON.SUBMIT].includes(e) ? buttonType.ascend : ''} disabled={this.state.isWaiting} onClick={() => this.onBtnClick(e)} key={`button_item_${i}`} className={s.button}>
                        <div className={`${s.buttonContainer + ' ' + 'showTitle text-capitalize'}`}> {this.state.isWaiting && e === BUTTON.SUBMIT ? <img className='icon' src='common/Spinner-white.svg' /> : null} <Lang>{e}</Lang></div>
                    </Button>
                })
            }
        </div>
    }

    renderContent() {
        return <div className={s.formContent} ref={ref => this._scroll = ref}>
            {this.renderTitle()}
            {this.renderTopInfo()}
            {this.renderForm()}
        </div>
    }

    renderTitle() {
        return <div className={s.mainTitle + ' ' + 'showTitle'} style={{ padding: '8px 0' }}><Lang>lang_add_government_id</Lang></div>
    }

    render() {
        if (!this.listData) return null
        return <div className={s.container}>
            {this.renderHeader()}
            {this.renderContent()}
            {this.renderFooter()}
        </div>
    }
}
class Error extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            color: '',
            isShow: false,
            error: ''
        }
    }

    showError = (err, color) => {
        this.setState({
            color,
            isShow: true,
            error: err
        })
    }

    hideError = () => {
        this.setState({
            isShow: false,
            error: ''
        })
    }

    render() {
        let bgColor = `var(${this.state.color})`
        return <div
            style={{ backgroundColor: bgColor }}
            className={` ${s.error} size--3 ${this.state.isShow ? '' : s.hidden}`}>
            {this.state.error}
        </div>
    }
}
export default AddGovernmentID
