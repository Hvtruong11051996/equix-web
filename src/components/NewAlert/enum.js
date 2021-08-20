import Lang from '../Inc/Lang/Lang';
import React from 'react';
import dataStorage from '../../dataStorage';
let targetvalue = []
const objFixTop = {
    'lang_everything': 'Everything',
    'lang_price_sensitive': 'PriceSensitive',
    'lang_trading_halt': 'TradingHalt',
    'lang_trading_halt_lifted': 'TradingHaltLifted'
}
const objBottom = {
    'lang_administrator_receiver_appointed_removed': 'Administrator/Receiver–Appointed/Removed',
    'lang_admission_to_official_list': 'AdmissiontoOfficialList',
    'lang_alteration_to_issued_capital': 'Alterationtoissuedcapital',
    'lang_alteration_to_notice_of_meeting': 'AlterationtoNoticeofMeeting',
    'lang_announcement_of_call': 'Announcementofcall',
    'lang_annual_report': 'AnnualReport',
    'lang_appendix_16a': 'Appendix16A',
    'lang_appendix_3b': 'Appendix3B',
    'lang_appendix_4g': 'Appendix4G',
    'lang_articles_of_association': 'ArticlesofAssociation',
    'lang_asset_acquisition': 'AssetAcquisition',
    'lang_asset_acquisition_disposal_other': 'AssetAcquisition&Disposal–Other',
    'lang_asset_acquisition_disposal': 'ASSETACQUISITION&DISPOSAL',
    'lang_asset_disposal': 'AssetDisposal',
    'lang_asx_announcement_other': 'ASXAnnouncement–Other',
    'lang_asx_announcement': 'ASXANNOUNCEMENT',
    'lang_asx_book_build_change_in_public_parameter': 'ASXBookBuild–ChangeinPublicParameter',
    'lang_asx_book_build_close_cancel': 'ASXBookBuild–Close/Cancel',
    'lang_asx_book_build_upcoming_commenced': 'ASXBookBuild–Upcoming/Commenced',
    'lang_asx_circulars': 'ASXCirculars',
    'lang_asx_query_other': 'ASXQuery–Other',
    'lang_asx_query': 'ASXQuery',
    'lang_becoming_a_substantial_holder': 'Becomingasubstantialholder',
    'lang_beneficial_owner_ship_part6c2': 'Beneficialownership–Part6C.2',
    'lang_bidders_statement_market_bid': 'Bidder’sStatement–Marketbid',
    'lang_bidders_statement_off_market_bid': 'Bidder’sStatement–Off-marketbid',
    'lang_bonus_issue_in_specie_issue': 'BonusIssue/In-SpecieIssue',
    'lang_capital_reconstruction': 'CapitalReconstruction',
    'lang_ceasing_to_be_a_substantial_holder': 'Ceasingtobeasubstantialholder',
    'lang_chairmans_address_other': 'Chairman’sAddress–Other',
    'lang_chairmans_address': 'CHAIRMAN’SADDRESS',
    'lang_chairmans_address_to_share_holders': 'Chairman’sAddresstoShareholders',
    'lang_change_in_basis_of_quotation': 'ChangeinBasisofQuotation',
    'lang_change_in_substantial_holding': 'Changeinsubstantialholding',
    'lang_change_of_balance_date': 'ChangeofBalanceDate',
    'lang_change_of_company_name': 'ChangeofCompanyName',
    'lang_change_of_directors_interest_notice': 'ChangeofDirector’sInterestNotice',
    'lang_cleansing_notice': 'CleansingNotice',
    'lang_commencement_of_official_quotation': 'CommencementofOfficialQuotation',
    'lang_commitments_test_entity_first_quarter_report': 'CommitmentsTestEntity–FirstQuarterReport',
    'lang_commitments_rest_entity_fourth_quarter_report': 'CommitmentsTestEntity–FourthQuarterReport',
    'lang_commitments_test_entity_second_quarter_report': 'CommitmentsTestEntity–SecondQuarterReport',
    'lang_commitments_test_entity_third_quarter_report': 'CommitmentsTestEntity–ThirdQuarterReport',
    'lang_commitments_test_entity_quarterly_reports_other': 'CommitmentsTestEntityQuarterlyReports–Other',
    'lang_commitments_test_entity_quarterly_reports': 'COMMITMENTSTESTENTITYQUARTERLYREPORTS',
    'lang_company_administration_other': 'CompanyAdministration–Other',
    'lang_company_administration': 'COMPANYADMINISTRATION',
    'lang_company_presentation_covers': 'CompanyPresentation(coverspresentationonbusinessupdatesprojectsactivitiesandothersthatacompanywillreportaspresentation)',
    'lang_company_secretary_appointment_resignation': 'CompanySecretaryAppointment/Resignation',
    'lang_concise_financial_report': 'ConciseFinancialReport',
    'lang_confirmation_that_annual_report_was_sent_to_security_holders': 'ConfirmationthatAnnualReportwassenttoSecurityHolders',
    'lang_constitution': 'Constitution',
    'lang_corporate_governance': 'CorporateGovernance',
    'lang_credit_rating': 'CreditRating',
    'lang_daily_fund_update': 'DailyFundUpdate',
    'lang_daily_share_buy_back_notice': 'DailyShareBuy-BackNotice',
    'lang_debt_facility': 'DebtFacility',
    'lang_details_of_company_address': 'DetailsofCompanyAddress',
    'lang_details_of_registered_office_address': 'DetailsofRegisteredofficeaddress',
    'lang_details_of_share_registry_address': 'DetailsofShareRegistryaddress',
    'lang_director_appointment_resignation': 'DirectorAppointment/Resignation',
    'lang_directors_statement_re_takeover': 'Directors’StatementreTakeover',
    'lang_disclosure_document': 'DisclosureDocument',
    'lang_distribution_announcement': 'DISTRIBUTIONANNOUNCEMENT',
    'lang_dividend_other': 'Dividend–Other',
    'lang_dividend_alteration': 'DividendAlteration',
    'lang_dividend_pay_date': 'DividendPayDate',
    'lang_dividend_rate': 'DividendRate',
    'lang_dividend_record_date': 'DividendRecordDate',
    'lang_dividend_reinvestment_plan': 'DividendReinvestmentPlan',
    'lang_end_of_day': 'EndofDay',
    'lang_final_directors_interest_notice': 'FinalDirector’sInterestNotice',
    'lang_first_quarter_activities_report': 'FirstQuarterActivitiesReport',
    'lang_first_quarter_cash_flow_report': 'FirstQuarterCashFlowReport',
    'lang_fourth_quarter_activities_report': 'FourthQuarterActivitiesReport',
    'lang_fourth_quarter_cash_flow_report': 'FourthQuarterCashFlowReport',
    'lang_full_year_accounts': 'FullYearAccounts',
    'lang_full_year_audit_review': 'FullYearAuditReview',
    'lang_full_year_directors_report': 'FullYearDirectors’Report',
    'lang_full_year_directors_statement': 'FullYearDirectors’Statement',
    'lang_half_year_accounts': 'HalfYearAccounts',
    'lang_half_year_audit_review': 'HalfYearAuditReview',
    'lang_half_year_directors_report': 'HalfYearDirectors’Report',
    'lang_half_year_directors_statement': 'HalfYearDirectors’Statement',
    'lang_half_yearly_report': 'HalfYearlyReport',
    'lang_indicative_non_binding_proposal': 'IndicativeNon-BindingProposal',
    'lang_initial_directors_interest_notice': 'InitialDirector’sInterestNotice',
    'lang_intention_to_make_take_over_bid': 'IntentiontoMakeTakeoverBid',
    'lang_interest_pay_date': 'InterestPayDate',
    'lang_interest_rate': 'InterestRate',
    'lang_interest_record_date': 'InterestRecordDate',
    'lang_internal': 'INTERNAL',
    'lang_external': 'EXTERNAL',
    'lang_issued_capital_other': 'IssuedCapital–Other',
    'lang_issued_capital': 'ISSUEDCAPITAL',
    'lang_issues_to_the_public': 'IssuestothePublic',
    'lang_legal_proceedings': 'LegalProceedings',
    'lang_letter_to_share_holders_other': 'LettertoShareholders–Other',
    'lang_letter_to_share_holders': 'LettertoShareholders',
    'lang_loan_securities_on_issue': 'Loansecuritiesonissue',
    'lang_map_cancellation': 'MAPCancellation',
    'lang_map_correction': 'MAPCorrection',
    'lang_map_test': 'MAPTest',
    'lang_mFund_alteration_to_issued_capital': 'mFund-AlterationtoIssuedCapital',
    'lang_mFund_daily_update': 'mFund-DailyUpdate',
    'lang_mFund_fund_profile': 'mFund-FundProfile',
    'lang_mFund_disclosure_document': 'mFund–DisclosureDocument',
    'lang_mFund_dividend_payment': 'mFund–DividendPayment',
    'lang_mFund_dividend_rate': 'mFund–DividendRate',
    'lang_mFund_dividend_record_date': 'mFund–DividendRecordDate',
    'lang_mFund_net_tangible_asset_backing': 'mFund–NetTangibleAssetbacking',
    'lang_mFund': 'mFund',
    'lang_net_tangible_asset_backing': 'NetTangibleAssetBacking',
    'lang_new_issue_letter_of_offer_acc_form': 'NewIssueLetterofOffer&Acc.Form',
    'lang_non_renounceable_issue': 'Non-RenounceableIssue',
    'lang_notice_of_annual_general_meeting': 'NoticeofAnnualGeneralMeeting',
    'lang_notice_of_call_other': 'NoticeofCall–Other',
    'lang_notice_of_call_contributing_shares': 'NOTICEOFCALL(ContributingShares)',
    'lang_notice_of_call_to_share_holders': 'Noticeofcalltoshareholders',
    'lang_notice_of_extraordinary_general_meeting': 'NoticeofExtraordinaryGeneralMeeting',
    'lang_notice_general_meeting': 'NoticeofGeneralMeeting',
    'lang_notice_of_meeting_other': 'NoticeofMeeting–Other',
    'lang_notice_of_meeting': 'NOTICEOFMEETING',
    'lang_notice_pending': 'NoticePending',
    'lang_off_market_bid_offer_document_to_bid_class_holders': 'Off-marketbidofferdocumenttobidclassholders',
    'lang_off_market_buy_back': 'Off-MarketBuy-Back',
    'lang_on_market_buy_back': 'On-MarketBuy-Back',
    'lang_open_briefing': 'OpenBriefing',
    'lang_other': 'OTHER',
    'lang_overseas_listing': 'OverseasListing',
    'lang_pleriodic_reports_other': 'PeriodicReports–Other',
    'lang_pleriodic_reports': 'PERIODICREPORTS',
    'lang_placement': 'Placement',
    'lang_preliminary_final_report': 'PreliminaryFinalReport',
    'lang_profit_guidance': 'ProfitGuidance',
    'lang_progress_report_other': 'ProgressReport–Other',
    'lang_progress_report_upper': 'PROGRESSREPORT',
    'lang_progress_report': 'ProgressReport',
    'lang_proxy_form': 'ProxyForm',
    'lang_quarterly_activities_report_other': 'QuarterlyActivitiesReport–Other',
    'lang_quarterly_activities_report': 'QUARTERLYACTIVITIESREPORT',
    'lang_quarterly_cash_flow_report_other': 'QuarterlyCashFlowReport–Other',
    'lang_quaterlt_cash_flow_report': 'QUARTERLYCASHFLOWREPORT',
    'lang_reinstatement_to_official_quotation': 'ReinstatementtoOfficialQuotation',
    'lang_removal_from_official_list': 'RemovalfromOfficialList',
    'lang_renounceable_issue': 'RenounceableIssue',
    'lang_reserved_for_future_use': 'ReservedForFutureUse',
    'lang_response_to_ASX_query': 'ResponsetoASXQuery',
    'lang_responsible_entity_appointment_resignation': 'ResponsibleEntityAppointment/Resignation',
    'lang_results_of_meeting': 'ResultsofMeeting',
    'lang_scheme_of_arrangement': 'SchemeofArrangement',
    'lang_second_quarter_activities_report': 'SecondQuarterActivitiesReport',
    'lang_second_quarter_cash_flow_report': 'SecondQuarterCashFlowReport',
    'lang_section_notice_director_interests': 'Section205GNotice–Director’sInterests',
    'lang_security_holder_details_other': 'Securityholderdetails–Other',
    'lang_security_holder_details': 'SECURITYHOLDERDETAILS',
    'lang_security_purchase_plan': 'SecurityPurchasePlan',
    'lang_standardand_poor_announcement': 'StandardandPoor’sAnnouncement',
    'lang_structured_oroducts_other': 'StructuredProducts–Other',
    'lang_structured_products': 'STRUCTUREDPRODUCTS',
    'lang_structured_products_acceptance': 'StructuredProductsAcceptance',
    'lang_structured_products_adjustment': 'StructuredProductsAdjustment',
    'lang_structured_products_disclosure_document': 'StructuredProductsDisclosureDocument',
    'lang_structured_products_distribution': 'StructuredProductsDistribution',
    'lang_structured_products_issuer_report': 'StructuredProductsIssuerReport',
    'lang_structured_products_supplementary_disclosure_document': 'StructuredProductsSupplementaryDisclosureDocument',
    'lang_structured_products_trust_deed': 'StructuredProductsTrustDeed',
    'lang_supplementary_bidder_statement': 'SupplementaryBidder’sStatement',
    'lang_supplementary_target_statement': 'SupplementaryTarget’sStatement',
    'lang_suspension_from_official_quotation': 'SuspensionfromOfficialQuotation',
    'lang_takeover_other': 'Takeover–Other',
    'lang_takeover_timer_applied': 'Takeover–TimerApplied',
    'lang_takeover_announcements_scheme_announcements': 'TakeoverAnnouncements/SchemeAnnouncements',
    'lang_takeoverupdate_section_notice': 'Takeoverupdate–Section671B©Notice',
    'lang_target_statement_market_bid': 'Target’sStatement–Marketbid',
    'lang_target_statement_off_market_bid': 'Target’sStatement–Off-marketbid',
    'lang_third_quarter_activities_report': 'ThirdQuarterActivitiesReport',
    'lang_third_quarter_cash_flow_report': 'ThirdQuarterCashFlowReport',
    'lang_top_20_share_holders': 'Top20shareholders',
    'lang_trading_policy': 'TradingPolicy',
    'lang_trust_12_month_accounts': 'Trust12monthaccounts',
    'lang_trust_6_month_accounts': 'Trust6monthaccounts',
    'lang_trust_deed': 'TrustDeed',
    'lang_trustee_appointment_resignation': 'TrusteeAppointment/Resignation',
    'lang_trust_manager_appointment/Resignation': 'TrustManagerAppointment/Resignation',
    'lang_variation_of_takeover_bid': 'VariationofTakeoverBid',
    'lang_waiver': 'Waiver',
    'lang_web_cast': 'WebCast',
    'lang_with_drawal_of_offer': 'WithdrawalofOffer',
    'lang_year_2000_advice': 'Year2000Advice'
}

const mapObj = (obj, className) => Object.keys(obj).map(key => {
    return {
        label: key,
        value: obj[key],
        className
    }
})

export const optionsAlertType = [
    {
        label: 'lang_last_price',
        value: 'LAST_PRICE'
    },
    {
        label: 'lang_bid_price',
        value: 'BID_PRICE'
    },
    {
        label: 'lang_offer_price',
        value: 'OFFER_PRICE'
    },
    {
        label: 'lang_today_change',
        value: 'CHANGE_POINT'
    },
    {
        label: 'lang_change_percent',
        value: 'CHANGE_PERCENT'
    },
    {
        label: 'lang_today_volume',
        value: 'TODAY_VOLUME'
    },
    {
        label: 'lang_news',
        value: 'NEWS'
    }
]

export const optionsTrigger = [
    {
        label: 'lang_at_or_above',
        value: 'AT_OR_ABOVE',
        className: 'text-capitalize'
    },
    {
        label: 'lang_above',
        value: 'ABOVE'
    },
    {
        label: 'lang_below',
        value: 'BELOW'
    },
    {
        label: 'lang_at_or_below',
        value: 'AT_OR_BELOW'
    }
]

export const optionsRepeat = [
    {
        label: 'lang_every_time',
        value: 'EVERYTIME'
    },
    {
        label: 'lang_once_only',
        value: 'ONCE_ONLY'
    }
]
export const optionsTarget = [
    {
        label: 'lang_user_input',
        value: 'USER_INPUT'
    },
    {
        label: 'lang_yesterday_open',
        value: 'YESTERDAY_OPEN'
    },
    {
        label: 'lang_yesterday_high',
        value: 'YESTERDAY_HIGH'
    },
    {
        label: 'lang_yesterday_low',
        value: 'YESTERDAY_LOW'
    },
    {
        label: 'lang_yesterday_close',
        value: 'YESTERDAY_CLOSE'
    },
    {
        label: 'lang_today_open',
        value: 'TODAY_OPEN'
    },

    {
        label: 'lang_today_high',
        value: 'TODAY_HIGH'
    },
    {
        label: 'lang_today_low',
        value: 'TODAY_LOW'
    }
]

export const optionsTargetFuture = [
    {
        label: 'lang_user_input',
        value: 'USER_INPUT'
    },
    {
        label: 'lang_yesterday_open',
        value: 'YESTERDAY_OPEN'
    },
    {
        label: 'lang_yesterday_high',
        value: 'YESTERDAY_HIGH'
    },
    {
        label: 'lang_yesterday_low',
        value: 'YESTERDAY_LOW'
    },
    {
        label: 'lang_yesterday_close',
        value: 'YESTERDAY_CLOSE'
    },
    {
        label: 'lang_yesterday_settlement',
        value: 'YESTERDAY_SETTLEMENT'
    },
    {
        label: 'lang_today_open',
        value: 'TODAY_OPEN'
    },

    {
        label: 'lang_today_high',
        value: 'TODAY_HIGH'
    },
    {
        label: 'lang_today_low',
        value: 'TODAY_LOW'
    }
]

export const optionsTargetNews = mapObj(objBottom, 'text-normal')
export const optionsTargetNewsFixTop = mapObj(objFixTop, 'text-capitalize')
