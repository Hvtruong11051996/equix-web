/* eslint-disable camelcase */

const validateTradeConfirmations = body => {
    const tradeConfirmations = body.trade_confirmations;
    for (const confirm of tradeConfirmations) {
        const { method } = confirm;
        if (method === 'EMAIL') {
            confirm.attention = confirm.email;
        }
        if ((method !== 'FAX' && confirm.fax) || (method === 'FAX' && !confirm.fax)) {
            console.error(`fax in trade_confirmations equired only if method = FAX`);
            return false;
        }
        if (((method !== 'POSTAL') && (
            confirm.postal_address_full_address ||
            confirm.postal_address_unit_flat_number ||
            confirm.postal_address_street_number ||
            confirm.postal_address_street_name ||
            confirm.postal_address_street_type ||
            confirm.postal_address_city_suburb ||
            confirm.postal_address_state ||
            confirm.postal_address_postcode ||
            confirm.postal_address_country
        )) ||
            ((method === 'POSTAL') && (
                !confirm.postal_address_full_address ||
                !confirm.postal_address_unit_flat_number ||
                !confirm.postal_address_street_number ||
                !confirm.postal_address_street_name ||
                !confirm.postal_address_street_type ||
                !confirm.postal_address_city_suburb ||
                !confirm.postal_address_state ||
                !confirm.postal_address_postcode ||
                !confirm.postal_address_country
            ))) {
            console.error(`postal_address_full_address or postal_address_unit_flat_number or postal_address_street_number or postal_address_street_name or postal_address_street_type or postal_address_city_suburb or postal_address_state or postal_address_postcode or postal_address_country or client_address required only if method = POSTAL`);
            return false;
        }
    }
    return true;
}

const validateApplicant = body => {
    const applicantDetails = body.applicant_details;
    for (const applicant of applicantDetails) {
        const { government_id, uploaded_documents } = applicant;
        if (applicant.tax_exemption && !applicant.tax_exemption_details) {
            console.error(`tax_exemption_details required when tax_exemption is TRUE`);
            return false;
        }
        if (applicant.relationship_type === 'OTHER' && !applicant.relationship_description) {
            console.error(`relationship_description required when relationship_type = OTHER`);
            return false;
        }
        if (!government_id && !uploaded_documents) {
            console.error(`applicant details have to have government_id or uploaded_documents`);
            return false;
        }
        if (government_id) {
            for (const item of government_id) {
                const { type } = item;
                if (((item.type === 'DRIVER_LICENSE') && (applicant.nationality === 'AUSTRALIA')) && !item.state_of_issue) {
                    console.error(`state_of_issue required only when type = DRIVER_LICENSE AND Nationality = AUSTRALIA`);
                    return false;
                }
                if (((type === 'DRIVER_LICENSE' && applicant.nationality === 'AUSTRALIA') && !item.state_of_issue) ||
                    (((type !== 'DRIVER_LICENSE' || applicant.nationality !== 'AUSTRALIA') && item.state_of_issue))) {
                    console.error(`state_of_issue have to have value when type = DRIVER_LICENSE AND nationality = AUSTRALIA`);
                    return false;
                }
                if ((type === 'MEDICARE_CARD' && (!item.medicare_name_on_card ||
                    !item.medicare_individual_reference_number ||
                    !item.medicare_card_colour ||
                    !item.medicare_card_expiry_date)) ||
                    ((type !== 'MEDICARE_CARD' && (item.medicare_name_on_card ||
                        item.medicare_individual_reference_number ||
                        item.medicare_card_colour ||
                        item.medicare_card_expiry_date)))) {
                    console.error(`medicare_name_on_card/medicare_individual_reference_number/medicare_card_colour/medicare_card_expiry_date have to have value when type = MEDICARE_CARD`);
                    return false;
                }
            }
        }
    }
    return true;
}

const validateCompanyDetails = body => {
    const { account_type } = body;
    if (((account_type === 'COMPANY' || account_type === 'TRUST_COMPANY' || account_type === 'SUPER_FUND_COMPANY') &&
        (!body.company_name ||
            !body.company_acn ||
            !(typeof body.company_tax_exemption === 'boolean') ||
            !body.company_type ||
            !body.company_country_of_incorporation ||
            !body.company_date_of_incorporation ||
            !body.company_nature_of_business_activity ||
            !(typeof body.company_same_as_roa === 'boolean') ||
            !body.company_principal_place_of_business_address_full_address ||
            !body.company_principal_place_of_business_address_unit_flat_number ||
            !body.company_principal_place_of_business_address_street_number ||
            !body.company_principal_place_of_business_address_street_name ||
            !body.company_principal_place_of_business_address_street_type ||
            !body.company_principal_place_of_business_address_city_suburb ||
            !body.company_principal_place_of_business_address_state ||
            !body.company_principal_place_of_business_address_postcode ||
            !body.company_principal_place_of_business_address_country ||
            !body.company_registered_office_address_full_address ||
            !body.company_registered_office_address_unit_flat_number ||
            !body.company_registered_office_address_street_number ||
            !body.company_registered_office_address_street_name ||
            !body.company_registered_office_address_street_type ||
            !body.company_registered_office_address_city_suburb ||
            !body.company_registered_office_address_state ||
            !body.company_registered_office_address_postcode ||
            !body.company_registered_office_address_country ||
            !body.company_mobile_phone ||
            !body.company_email)) ||
        (((account_type !== 'COMPANY' && account_type !== 'TRUST_COMPANY' && account_type !== 'SUPER_FUND_COMPANY') &&
            (body.company_name ||
                body.company_acn ||
                (typeof body.company_tax_exemption === 'boolean') ||
                body.company_type ||
                body.company_country_of_incorporation ||
                body.company_date_of_incorporation ||
                body.company_nature_of_business_activity ||
                (typeof body.company_same_as_roa === 'boolean') ||
                body.company_principal_place_of_business_address_full_address ||
                body.company_principal_place_of_business_address_unit_flat_number ||
                body.company_principal_place_of_business_address_street_number ||
                body.company_principal_place_of_business_address_street_name ||
                body.company_principal_place_of_business_address_street_type ||
                body.company_principal_place_of_business_address_city_suburb ||
                body.company_principal_place_of_business_address_state ||
                body.company_principal_place_of_business_address_postcode ||
                body.company_principal_place_of_business_address_country ||
                body.company_registered_office_address_full_address ||
                body.company_registered_office_address_unit_flat_number ||
                body.company_registered_office_address_street_number ||
                body.company_registered_office_address_street_name ||
                body.company_registered_office_address_street_type ||
                body.company_registered_office_address_city_suburb ||
                body.company_registered_office_address_state ||
                body.company_registered_office_address_postcode ||
                body.company_registered_office_address_country ||
                body.company_mobile_phone ||
                body.company_email)))) {
        console.error(`company_* have to have values when account_type is COMPANY / TRUST_COMPANY / SUPER_FUND_COMPANY`);
        return false;
    }
    if ((body.company_tax_exemption && !body.company_tax_exemption_details) ||
        (!body.company_tax_exemption && body.company_tax_exemption_details)) {
        console.error(` company_tax_exemption_details required when company_tax_exemption is TRUE`);
        return false;
    }
    if (account_type === 'COMPANY' || account_type === 'TRUST_COMPANY' || account_type === 'SUPER_FUND_COMPANY') {
        // if account_type = COMPANY, TRUST_COMPANY, SUPER_FUND_COMPANY, Default: 54494541000
        body.company_industry = '54494541000';
    }
    return true;
}

const validateTrustDetails = body => {
    const { account_type } = body;
    if (((account_type === 'TRUST_COMPANY' || account_type === 'TRUST_INDIVIDUAL') &&
        (
            !body.trust_name ||
            !body.trust_type ||
            !body.trust_country_of_establishment ||
            !body.trust_asset_source_details ||
            !body.trust_activity ||
            !(typeof body.trust_tax_exemption === 'boolean')

        )) ||
        (((account_type !== 'TRUST_COMPANY' && account_type !== 'TRUST_INDIVIDUAL') &&
            (
                body.trust_name ||
                body.trust_type ||
                body.trust_country_of_establishment ||
                body.trust_asset_source_details ||
                body.trust_activity ||
                (typeof body.trust_tax_exemption === 'boolean')

            )))) {
        console.error(`trust_* have to have values if account_type is TRUST_COMPANY / TRUST_INDIVIDUAL`);
        return false;
    }
    if ((body.trust_tax_exemption_details && !body.trust_tax_exemption) ||
        ((!body.trust_tax_exemption_details && body.trust_tax_exemption))) {
        console.error(`trust_tax_exemption_details have value when trust_tax_exemption is true`);
        return false;
    }
    return true;
}

const validateSuperFundDetails = body => {
    const { account_type } = body;
    if (((account_type === 'SUPER_FUND_COMPANY' || account_type === 'SUPER_FUND_INDIVIDUAL') &&
        (
            !body.super_fund_name ||
            !body.super_fund_abn ||
            !(typeof body.super_fund_tax_exemption === 'boolean') ||
            !(typeof body.smsf === 'boolean')
        )) ||
        (((account_type !== 'SUPER_FUND_COMPANY' && account_type !== 'SUPER_FUND_INDIVIDUAL') &&
            (
                body.super_fund_name ||
                body.super_fund_abn ||
                (typeof body.super_fund_tax_exemption === 'boolean') ||
                (typeof body.smsf === 'boolean')
            )))) {
        console.error(`super_fund_* have to have values if account_type is SUPER_FUND_COMPANY / SUPER_FUND_INDIVIDUAL`);
        return false
    }
    if ((body.super_fund_tax_exemption && !body.super_fund_tax_exemption_details) ||
        ((!body.super_fund_tax_exemption && body.super_fund_tax_exemption_details))) {
        console.error(`super_fund_tax_exemption_details have to have value if super_fund_tax_exemption is TRUE`);
        return false;
    }
    return true;
}

const validateBankDetails = body => {
    const { settlement_method, bank_account_type } = body
    if ((bank_account_type === 'EMPTY') &&
        ((settlement_method === 'SPONSORED_NEW_HIN') ||
            (settlement_method === 'SPONSORED_HIN_TRANSFER') ||
            (settlement_method === 'ISSUER_SPONSORED'))) {
        console.error(`bank_account_type is EMPTY - No Cash Settlement (Not allowed when Settlement Method is (SPONSORED_NEW_HIN, SPONSORED_HIN_TRANSFER or ISSUER_SPONSORED)`);
        return false;
    }
    if ((body.bank_cmt_provider && (bank_account_type !== 'LINKED_CMT_CMA')) ||
        ((!body.bank_cmt_provider && (bank_account_type === 'LINKED_CMT_CMA')))) {
        console.error(`bank_cmt_provider required when bank_account_type is LINKED_CMT_CMA`);
        return false;
    }
    if (((((bank_account_type === 'BANK_ACCOUNT') || (bank_account_type === 'LINKED_CMT_CMA')) &&
        (!body.bank_bsb || !body.bank_account_number || !body.bank_account_name || !body.bank_transaction_type))) ||
        ((((bank_account_type !== 'BANK_ACCOUNT') && (bank_account_type !== 'LINKED_CMT_CMA')) &&
            (body.bank_bsb || body.bank_account_number || body.bank_account_name || body.bank_transaction_type)))) {
        console.error(`bank_bsb, bank_account_number, bank_account_name, bank_transaction_type required when bank_account_type is (BANK_ACCOUNT or LINKED_CMT_CMA)`);
        return false;
    }
    return true;
}

module.exports.validateBankDetails = validateBankDetails;

export const validateBody = body => {
    try {
        const { settlement_method, bank_account_type, account_type } = body

        body.tradeable_products = body.tradeable_products || {};
        body.tradeable_products.equity = 'S0058';

        if (((body.cma_source_of_funds !== 'OTHER') &&
            (
                body.cma_source_of_funds_desc ||
                body.cma_account_purpose_desc
            )) ||
            ((body.cma_source_of_funds === 'OTHER') &&
                (
                    !body.cma_source_of_funds_desc ||
                    !body.cma_account_purpose_desc
                ))) {
            console.error(`cma_source_of_funds_desc or cma_account_purpose_desc required only if cma_source_of_funds = OTHER`);
            return false;
        }
        if (!validateTradeConfirmations(body)) return false;
        if ((settlement_method !== 'SPONSORED_HIN_TRANSFER') && body.settlement_existing_hin) {
            console.error(`settlement_existing_hin required when settlement_method is SPONSORED_HIN_TRANSFER`);
            return false;
        }
        if ((((settlement_method === 'SPONSORED_HIN_TRANSFER') || (settlement_method === 'DVP')) && !body.settlement_pid) ||
            (((settlement_method !== 'SPONSORED_HIN_TRANSFER') && (settlement_method !== 'DVP')) && body.settlement_pid)) {
            console.error(`settlement_pid required when settlement_method is (SPONSORED_HIN_TRANSFER or DVP)`);
            return false;
        }
        if ((body.settlement_supplementary_reference && (settlement_method !== 'DVP')) ||
            (!body.settlement_supplementary_reference && (settlement_method === 'DVP'))) {
            console.error(`settlement_supplementary_reference required when settlement_method is DVP`);
            return false;
        }
        if (!validateCompanyDetails(body)) return false;
        if (!validateTrustDetails(body)) return false;
        if (!validateSuperFundDetails(body)) return false;
        if (!validateApplicant(body)) return false;
        return true;
    } catch (error) {
        console.error(`catch validate body error: ${error}`);
        return false;
    }
}
