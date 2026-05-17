--
-- PostgreSQL database dump
--

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.0

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.audit_log_entries (instance_id, id, payload, created_at, ip_address) FROM stdin;
\.


--
-- Data for Name: custom_oauth_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.custom_oauth_providers (id, provider_type, identifier, name, client_id, client_secret, acceptable_client_ids, scopes, pkce_enabled, attribute_mapping, authorization_params, enabled, email_optional, issuer, discovery_url, skip_nonce_check, cached_discovery, discovery_cached_at, authorization_url, token_url, userinfo_url, jwks_uri, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.flow_state (id, user_id, auth_code, code_challenge_method, code_challenge, provider_type, provider_access_token, provider_refresh_token, created_at, updated_at, authentication_method, auth_code_issued_at, invite_token, referrer, oauth_client_state_id, linking_target_id, email_optional) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, invited_at, confirmation_token, confirmation_sent_at, recovery_token, recovery_sent_at, email_change_token_new, email_change, email_change_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at, phone, phone_confirmed_at, phone_change, phone_change_token, phone_change_sent_at, email_change_token_current, email_change_confirm_status, banned_until, reauthentication_token, reauthentication_sent_at, is_sso_user, deleted_at, is_anonymous) FROM stdin;
\.


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at, id) FROM stdin;
\.


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.instances (id, uuid, raw_base_config, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.oauth_clients (id, client_secret_hash, registration_type, redirect_uris, grant_types, client_name, client_uri, logo_uri, created_at, updated_at, deleted_at, client_type, token_endpoint_auth_method) FROM stdin;
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.sessions (id, user_id, created_at, updated_at, factor_id, aal, not_after, refreshed_at, user_agent, ip, tag, oauth_client_id, refresh_token_hmac_key, refresh_token_counter, scopes) FROM stdin;
\.


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.mfa_amr_claims (session_id, created_at, updated_at, authentication_method, id) FROM stdin;
\.


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.mfa_factors (id, user_id, friendly_name, factor_type, status, created_at, updated_at, secret, phone, last_challenged_at, web_authn_credential, web_authn_aaguid, last_webauthn_challenge_data) FROM stdin;
\.


--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.mfa_challenges (id, factor_id, created_at, verified_at, ip_address, otp_code, web_authn_session_data) FROM stdin;
\.


--
-- Data for Name: oauth_authorizations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.oauth_authorizations (id, authorization_id, client_id, user_id, redirect_uri, scope, state, resource, code_challenge, code_challenge_method, response_type, status, authorization_code, created_at, expires_at, approved_at, nonce) FROM stdin;
\.


--
-- Data for Name: oauth_client_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.oauth_client_states (id, provider_type, code_verifier, created_at) FROM stdin;
\.


--
-- Data for Name: oauth_consents; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.oauth_consents (id, user_id, client_id, scopes, granted_at, revoked_at) FROM stdin;
\.


--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.one_time_tokens (id, user_id, token_type, token_hash, relates_to, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.refresh_tokens (instance_id, id, token, user_id, revoked, created_at, updated_at, parent, session_id) FROM stdin;
\.


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.sso_providers (id, resource_id, created_at, updated_at, disabled) FROM stdin;
\.


--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.saml_providers (id, sso_provider_id, entity_id, metadata_xml, metadata_url, attribute_mapping, created_at, updated_at, name_id_format) FROM stdin;
\.


--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.saml_relay_states (id, sso_provider_id, request_id, for_email, redirect_to, created_at, updated_at, flow_state_id) FROM stdin;
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.schema_migrations (version) FROM stdin;
20171026211738
20171026211808
20171026211834
20180103212743
20180108183307
20180119214651
20180125194653
00
20210710035447
20210722035447
20210730183235
20210909172000
20210927181326
20211122151130
20211124214934
20211202183645
20220114185221
20220114185340
20220224000811
20220323170000
20220429102000
20220531120530
20220614074223
20220811173540
20221003041349
20221003041400
20221011041400
20221020193600
20221021073300
20221021082433
20221027105023
20221114143122
20221114143410
20221125140132
20221208132122
20221215195500
20221215195800
20221215195900
20230116124310
20230116124412
20230131181311
20230322519590
20230402418590
20230411005111
20230508135423
20230523124323
20230818113222
20230914180801
20231027141322
20231114161723
20231117164230
20240115144230
20240214120130
20240306115329
20240314092811
20240427152123
20240612123726
20240729123726
20240802193726
20240806073726
20241009103726
20250717082212
20250731150234
20250804100000
20250901200500
20250903112500
20250904133000
20250925093508
20251007112900
20251104100000
20251111201300
20251201000000
20260115000000
20260121000000
20260219120000
20260302000000
\.


--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.sso_domains (id, sso_provider_id, domain, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: webauthn_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.webauthn_challenges (id, user_id, challenge_type, session_data, created_at, expires_at) FROM stdin;
\.


--
-- Data for Name: webauthn_credentials; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.webauthn_credentials (id, user_id, credential_id, public_key, attestation_type, aaguid, sign_count, transports, backup_eligible, backed_up, friendly_name, created_at, updated_at, last_used_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, student_code, name, email, password_hash, role, created_at) FROM stdin;
1007d1de-8bc0-4ab6-be09-335aa8d5b649	\N	Hùng Clc	student10@gmail.com	123456	student	2026-05-17 05:10:26.031543
6874d60c-c650-4fcb-82fe-f322cb21ae41	\N	Admin	admin@unihub.com	123456	admin	2026-04-29 19:08:57.761935
4600872c-c6cc-49c9-8b1d-8617a8e78867	\N	Staff	staff@unihub.com	123456	staff	2026-04-29 19:09:26.844152
b50f9517-7ea8-4717-92e3-01cb836ff3b9	SV001	UniHub Tester	buicuong7954@gmail.com	123456	student	2026-04-29 18:20:16.11287
cc493556-7d1d-422c-a118-5fb6c75351f3	SV002	Trần Mạnh Hùng	hungtmh20002@gmail.com	123456	student	2026-05-14 06:02:19.814295
00a0e4a2-1a2b-4ce2-a258-91e3f5230300	SV003	Hùng Trần	student1@gmail.com	123456	student	2026-05-14 08:40:32.349396
0989f67d-ff23-47bb-b2e3-2ff08668e261	SV004	Mạnh Hùng	student2@gmail.com	123456	student	2026-05-14 09:17:09.890158
11905e69-d00f-4551-96cb-28f44724707a	SV005	Mạnh Hùng clc10	student3@gmail.com	123456	student	2026-05-14 14:00:51.793084
e17577a1-2ec7-4dbe-b69c-3ad4d6115156	SV006	Mạnh Hùng 23127195	student4@gmail.com	123456	student	2026-05-14 14:15:21.12078
c26903c5-f55c-42e5-8f2e-dd6f8aa47a2f	SV007	Hùng cla	student5@gmail.com	123456	student	2026-05-15 03:18:05.439163
36e1ac5f-279f-4623-853b-8b491b31e977	SV008	HÙNG T1	student6@gmail.com	123456	student	2026-05-15 03:21:37.519293
4c21d864-684c-47ce-a9a8-76e2dbbba141	\N	Staff Hùng	staff1@gmail.com	123456	staff	2026-05-17 05:17:05.188441
0e555b69-9b83-4672-a02b-9d9e1ae31bed	SV400	Sinh Viên 400	sv400@example.com	SV400#sv400	student	2026-05-17 02:51:59.464736
4da71c26-1928-4366-952d-4a61463708c0	SV401	Sinh Viên 401	sv401@example.com	SV401#sv401	student	2026-05-17 02:51:59.464736
6fab2fe5-c005-4c3e-9ced-b8cdb03d94ba	SV402	Sinh Viên 402 (Updated)	sv402@example.com	SV402#sv402	student	2026-05-17 02:51:59.464736
6febb111-11b9-4502-94ef-f6b041bb73f4	SV403	Sinh Viên 403	sv403@example.com	SV403#sv403	student	2026-05-17 02:51:59.464736
c788aa22-a455-4c3e-b73b-ea90a8dfaca0	SV404	Sinh Viên 404	sv404@example.com	SV404#sv404	student	2026-05-17 02:51:59.464736
a481eb75-6c43-4b53-9cf9-bc84684a3751	SV405	Sinh Viên 405	sv405@example.com	SV405#sv405	student	2026-05-17 02:51:59.464736
3552c1f8-a2b6-4294-b516-d009ad190c0e	SV406	Sinh Viên 406	sv406@example.com	SV406#sv406	student	2026-05-17 02:51:59.464736
16728554-a7a2-4db0-b904-7425ba585173	SV407	Sinh Viên 407 (Updated)	sv407@example.com	SV407#sv407	student	2026-05-17 02:51:59.464736
913ff173-cf28-4b00-9ef7-99093b2a6e06	SV408	Sinh Viên 408	sv408@example.com	SV408#sv408	student	2026-05-17 02:51:59.464736
e33ba78b-f51e-4b75-89f7-60ba3e877155	SV409	Sinh Viên 409	sv409@example.com	SV409#sv409	student	2026-05-17 02:51:59.464736
c9b769aa-15d2-41ad-aa3f-0e7ee8992105	SV410	Sinh Viên 410	sv410@example.com	SV410#sv410	student	2026-05-17 02:51:59.464736
debb6015-ccd2-4b9c-8064-714723f33416	SV411	Sinh Viên 411	sv411@example.com	SV411#sv411	student	2026-05-17 02:51:59.464736
4e8c8699-59dd-428b-8084-db194ccd11b6	SV412	Sinh Viên 412 (Updated)	sv412@example.com	SV412#sv412	student	2026-05-17 02:51:59.464736
a955119d-feec-421a-be4c-82295ce7210f	SV413	Sinh Viên 413	sv413@example.com	SV413#sv413	student	2026-05-17 02:51:59.464736
24d6fbfd-8b18-4483-bea6-acfb25648500	SV414	Sinh Viên 414	sv414@example.com	SV414#sv414	student	2026-05-17 02:51:59.464736
94a77747-e320-47df-9194-340d0ab1014b	SV415	Sinh Viên 415	sv415@example.com	SV415#sv415	student	2026-05-17 02:51:59.464736
1ebbdaa5-cdaa-490d-a7a3-d9d716a4d3ad	SV416	Sinh Viên 416	sv416@example.com	SV416#sv416	student	2026-05-17 02:51:59.464736
69e53d1e-0cdc-4b8a-a9b6-f27258561bbd	SV417	Sinh Viên 417 (Updated)	sv417@example.com	SV417#sv417	student	2026-05-17 02:51:59.464736
9959ac2c-8099-42a9-835e-3581975eaea8	SV418	Sinh Viên 418 (Updated)	sv418@example.com	SV418#sv418	student	2026-05-17 02:51:59.464736
da20aa3d-6608-4dd2-aec0-ee6dbac80db3	SV419	Sinh Viên 419	sv419@example.com	SV419#sv419	student	2026-05-17 02:51:59.464736
60e282fd-2066-4eac-9349-c3bb47f37650	SV420	Sinh Viên 420	sv420@example.com	SV420#sv420	student	2026-05-17 02:51:59.464736
1feacdc0-5d6c-4dd0-9a86-cb04fb7c3d09	SV421	Sinh Viên 421	sv421@example.com	SV421#sv421	student	2026-05-17 02:51:59.464736
035dc111-500d-4d19-afac-649d8cdd879c	SV422	Sinh Viên 422 (Updated)	sv422@example.com	SV422#sv422	student	2026-05-17 02:51:59.464736
1472896f-99b0-4e60-a30a-3a3d58d838da	SV423	Sinh Viên 423	sv423@example.com	SV423#sv423	student	2026-05-17 02:51:59.464736
a1b3cb56-6b94-4a33-a2d8-bd7705086122	SV424	Sinh Viên 424 (Updated)	sv424@example.com	SV424#sv424	student	2026-05-17 02:51:59.464736
97d9af33-8067-42a6-9f60-c04548f64960	SV425	Sinh Viên 425	sv425@example.com	SV425#sv425	student	2026-05-17 02:51:59.464736
78f866f1-65e0-4cf4-91fe-35b3aa75627f	SV426	Sinh Viên 426 (Updated)	sv426@example.com	SV426#sv426	student	2026-05-17 02:51:59.464736
e9280095-d7dd-4fba-8b69-0429084c01bd	SV427	Sinh Viên 427 (Updated)	sv427@example.com	SV427#sv427	student	2026-05-17 02:51:59.464736
8e5b86f8-6e10-43c4-968c-e9dfbc8df622	SV428	Sinh Viên 428	sv428@example.com	SV428#sv428	student	2026-05-17 02:51:59.464736
0609b1ac-40d0-40a0-b2b2-b8e5b07e27f9	SV429	Sinh Viên 429	sv429@example.com	SV429#sv429	student	2026-05-17 02:51:59.464736
4b3401d6-b2d4-4244-9e9b-c9972e9f8bf2	SV430	Sinh Viên 430 (Updated)	sv430@example.com	SV430#sv430	student	2026-05-17 02:51:59.464736
db8df7b3-7607-4f91-aaca-e36f6ef01d75	SV431	Sinh Viên 431	sv431@example.com	SV431#sv431	student	2026-05-17 02:51:59.464736
0f06afeb-7085-42ab-bf0b-a9284116f367	SV432	Sinh Viên 432	sv432@example.com	SV432#sv432	student	2026-05-17 02:51:59.464736
6899d9fb-2209-46e1-bff6-d6dcc6a8f1bd	SV433	Sinh Viên 433 (Updated)	sv433@example.com	SV433#sv433	student	2026-05-17 02:51:59.464736
a730a874-e6aa-4b48-9b25-d25ba3012896	SV434	Sinh Viên 434 (Updated)	sv434@example.com	SV434#sv434	student	2026-05-17 02:51:59.464736
307c745b-24a0-45a7-9b07-d9325e73965c	SV435	Sinh Viên 435 (Updated)	sv435@example.com	SV435#sv435	student	2026-05-17 02:51:59.464736
266ffbbf-6451-4422-a29c-4bd94147b9c1	SV436	Sinh Viên 436	sv436@example.com	SV436#sv436	student	2026-05-17 02:51:59.464736
c46937c2-4050-4b6f-a326-3ca2e60aa6a5	SV437	Sinh Viên 437	sv437@example.com	SV437#sv437	student	2026-05-17 02:51:59.464736
b7c6dc7b-3075-4d60-b883-372677a0ee33	SV438	Sinh Viên 438	sv438@example.com	SV438#sv438	student	2026-05-17 02:51:59.464736
f11209f3-0656-418d-89e1-b85325767349	SV439	Sinh Viên 439 (Updated)	sv439@example.com	SV439#sv439	student	2026-05-17 02:51:59.464736
149758ba-64f6-4fee-a12f-9aa206955ca8	SV440	Sinh Viên 440 (Updated)	sv440@example.com	SV440#sv440	student	2026-05-17 02:51:59.464736
a163b96d-7aa6-4ced-9c23-f146f7d483fd	SV441	Sinh Viên 441 (Updated)	sv441@example.com	SV441#sv441	student	2026-05-17 02:51:59.464736
9c3b55db-0323-4ec4-b496-cda17741066b	SV442	Sinh Viên 442	sv442@example.com	SV442#sv442	student	2026-05-17 02:51:59.464736
55b3b7e8-1da4-47a0-b4eb-a9a1468aa38f	SV443	Sinh Viên 443	sv443@example.com	SV443#sv443	student	2026-05-17 02:51:59.464736
1f5f55b2-e760-471d-9b89-f9fd3ad63586	SV444	Sinh Viên 444	sv444@example.com	SV444#sv444	student	2026-05-17 02:51:59.464736
696c9340-8844-47ea-8538-9dc3d650e3ac	SV445	Sinh Viên 445	sv445@example.com	SV445#sv445	student	2026-05-17 02:51:59.464736
7a3b1dc1-c0ef-44d6-af22-5cd805ed3e0e	SV446	Sinh Viên 446 (Updated)	sv446@example.com	SV446#sv446	student	2026-05-17 02:51:59.464736
d0e1a75f-6a62-4225-a4a7-fa9bd4c48fb8	SV447	Sinh Viên 447	sv447@example.com	SV447#sv447	student	2026-05-17 02:51:59.464736
08acf9bc-992f-4be4-8aa0-2204b8a292c1	SV448	Sinh Viên 448	sv448@example.com	SV448#sv448	student	2026-05-17 02:51:59.464736
6d031783-8e4d-465b-bd8d-19361f41b24d	SV449	Sinh Viên 449	sv449@example.com	SV449#sv449	student	2026-05-17 02:51:59.464736
47598005-6288-4a7d-b08c-d4d2f97a9b27	SV450	Sinh Viên 450	sv450@example.com	SV450#sv450	student	2026-05-17 02:51:59.464736
ffd58d6e-ec59-441f-81b8-b30806a3ead4	SV451	Sinh Viên 451 (Updated)	sv451@example.com	SV451#sv451	student	2026-05-17 02:51:59.464736
dabb8424-728b-4524-afa5-8d2788aa9bc5	SV452	Sinh Viên 452 (Updated)	sv452@example.com	SV452#sv452	student	2026-05-17 02:51:59.464736
a5a80c92-e1b0-412a-8365-e26a03ed0c3e	SV453	Sinh Viên 453 (Updated)	sv453@example.com	SV453#sv453	student	2026-05-17 02:51:59.464736
182de980-2616-4cca-98b6-0101e90cb213	SV454	Sinh Viên 454	sv454@example.com	SV454#sv454	student	2026-05-17 02:51:59.464736
390684cf-f663-41f9-88f3-ba2bd0104768	SV455	Sinh Viên 455	sv455@example.com	SV455#sv455	student	2026-05-17 02:51:59.464736
94e19f1a-82cb-469e-886e-14360e47ed03	SV456	Sinh Viên 456 (Updated)	sv456@example.com	SV456#sv456	student	2026-05-17 02:51:59.464736
033ea498-42d2-48ab-be51-9895b2405d5f	SV457	Sinh Viên 457	sv457@example.com	SV457#sv457	student	2026-05-17 02:51:59.464736
15d8210d-b0f6-4196-83a6-ef5081f2a660	SV458	Sinh Viên 458 (Updated)	sv458@example.com	SV458#sv458	student	2026-05-17 02:51:59.464736
159205be-7bf8-43db-9532-6e9eb32438fe	SV459	Sinh Viên 459	sv459@example.com	SV459#sv459	student	2026-05-17 02:51:59.464736
e03be555-cb62-4901-a77f-578f9ba861ad	SV460	Sinh Viên 460 (Updated)	sv460@example.com	SV460#sv460	student	2026-05-17 02:51:59.464736
297cc165-7f10-4eb0-ba22-236f6716ceca	SV461	Sinh Viên 461	sv461@example.com	SV461#sv461	student	2026-05-17 02:51:59.464736
5d1d9f49-4d29-4164-b33a-d84bccdac2ce	SV462	Sinh Viên 462 (Updated)	sv462@example.com	SV462#sv462	student	2026-05-17 02:51:59.464736
3950f223-8442-4f86-bd06-dcc832211470	SV463	Sinh Viên 463	sv463@example.com	SV463#sv463	student	2026-05-17 02:51:59.464736
df7bc57a-7a5b-4e57-99ee-15ef34071854	SV464	Sinh Viên 464 (Updated)	sv464@example.com	SV464#sv464	student	2026-05-17 02:51:59.464736
9f6d8e85-142d-458d-864e-7181c1c34794	SV465	Sinh Viên 465 (Updated)	sv465@example.com	SV465#sv465	student	2026-05-17 02:51:59.464736
b1ad5cce-f245-4cc4-a021-a4b7f4e17e4f	SV466	Sinh Viên 466	sv466@example.com	SV466#sv466	student	2026-05-17 02:51:59.464736
c1be50eb-847b-4bd7-8a5f-7c9fd0d61e96	SV467	Sinh Viên 467 (Updated)	sv467@example.com	SV467#sv467	student	2026-05-17 02:51:59.464736
e14f1aac-e92b-41d0-844b-d84401c4857b	SV468	Sinh Viên 468	sv468@example.com	SV468#sv468	student	2026-05-17 02:51:59.464736
297c5629-fa5a-49e6-a5b8-89ab8a5d0526	SV469	Sinh Viên 469	sv469@example.com	SV469#sv469	student	2026-05-17 02:51:59.464736
1ab1d19d-8a07-4cac-90c3-2e0c09f73f13	SV470	Sinh Viên 470	sv470@example.com	SV470#sv470	student	2026-05-17 02:51:59.464736
1df34df7-ddf6-45f2-80b4-aca734deac3f	SV471	Sinh Viên 471	sv471@example.com	SV471#sv471	student	2026-05-17 02:51:59.464736
a8ecd602-a185-4a08-a0e7-73b2428ae0cc	SV472	Sinh Viên 472	sv472@example.com	SV472#sv472	student	2026-05-17 02:51:59.464736
e88dea4a-9a0a-43c6-b553-4e209594a176	SV473	Sinh Viên 473 (Updated)	sv473@example.com	SV473#sv473	student	2026-05-17 02:51:59.464736
8b563998-6643-4e95-a1b2-b2c35662aebd	SV474	Sinh Viên 474	sv474@example.com	SV474#sv474	student	2026-05-17 02:51:59.464736
d40bfb2f-10b8-416f-a128-5d1474065247	SV475	Sinh Viên 475	sv475@example.com	SV475#sv475	student	2026-05-17 02:51:59.464736
f2a02328-f8ef-4f85-928d-41bf6f4b17f2	SV476	Sinh Viên 476 (Updated)	sv476@example.com	SV476#sv476	student	2026-05-17 02:51:59.464736
23d79ba3-3782-4265-aec1-0f867f0a618b	SV477	Sinh Viên 477	sv477@example.com	SV477#sv477	student	2026-05-17 02:51:59.464736
b7b96590-0b2c-4f34-9395-f9e92bc40d9b	SV478	Sinh Viên 478	sv478@example.com	SV478#sv478	student	2026-05-17 02:51:59.464736
d85d3236-ac24-4dd8-b6a8-047d4fd14a96	SV479	Sinh Viên 479 (Updated)	sv479@example.com	SV479#sv479	student	2026-05-17 02:51:59.464736
51f118ca-e88d-43ac-8625-149957b3506c	SV480	Sinh Viên 480	sv480@example.com	SV480#sv480	student	2026-05-17 02:51:59.464736
e5101736-8625-45b4-a67c-f714c07a93cc	SV481	Sinh Viên 481	sv481@example.com	SV481#sv481	student	2026-05-17 02:51:59.464736
55905576-a2b9-4e80-bf94-b7419d9bc37c	SV482	Sinh Viên 482 (Updated)	sv482@example.com	SV482#sv482	student	2026-05-17 02:51:59.464736
95cc3a74-406d-4fa6-9c24-13b6875fca27	SV483	Sinh Viên 483 (Updated)	sv483@example.com	SV483#sv483	student	2026-05-17 02:51:59.464736
a744a862-4485-4a03-b22f-4649bfb51d2c	SV484	Sinh Viên 484	sv484@example.com	SV484#sv484	student	2026-05-17 02:51:59.464736
300c8c7a-02f9-4e07-a9dc-f73187652e1b	SV485	Sinh Viên 485	sv485@example.com	SV485#sv485	student	2026-05-17 02:51:59.464736
e2dc0524-4520-4573-9b1c-978a6df5c9ac	SV486	Sinh Viên 486 (Updated)	sv486@example.com	SV486#sv486	student	2026-05-17 02:51:59.464736
5b02f084-0525-47bf-a6be-e9be9afed75c	SV487	Sinh Viên 487 (Updated)	sv487@example.com	SV487#sv487	student	2026-05-17 02:51:59.464736
c74caab1-c06b-499f-8ed9-77971ae69596	SV488	Sinh Viên 488	sv488@example.com	SV488#sv488	student	2026-05-17 02:51:59.464736
33146cbc-a42a-4867-a96f-8edd5db142b7	SV489	Sinh Viên 489 (Updated)	sv489@example.com	SV489#sv489	student	2026-05-17 02:51:59.464736
d1a695e5-5371-445c-883e-c1df7c9da9f8	SV490	Sinh Viên 490 (Updated)	sv490@example.com	SV490#sv490	student	2026-05-17 02:51:59.464736
ad41dc71-2ff2-4a00-9762-516c65d99da7	SV491	Sinh Viên 491 (Updated)	sv491@example.com	SV491#sv491	student	2026-05-17 02:51:59.464736
6dd3af65-c323-4060-a77e-89b80e9b4e22	SV492	Sinh Viên 492	sv492@example.com	SV492#sv492	student	2026-05-17 02:51:59.464736
222b7348-5135-40e1-91eb-e89f519ec9b2	SV493	Sinh Viên 493 (Updated)	sv493@example.com	SV493#sv493	student	2026-05-17 02:51:59.464736
0099e1fb-72af-4a4b-ad46-69925b40ee5d	SV494	Sinh Viên 494	sv494@example.com	SV494#sv494	student	2026-05-17 02:51:59.464736
c374e962-ce5b-44cf-9d3c-c2f4d937255a	SV495	Sinh Viên 495	sv495@example.com	SV495#sv495	student	2026-05-17 02:51:59.464736
d521a266-f610-4fa6-9b98-cfec999be529	SV496	Sinh Viên 496	sv496@example.com	SV496#sv496	student	2026-05-17 02:51:59.464736
53a62059-a73d-4656-8323-4fff0ff49fcb	SV497	Sinh Viên 497	sv497@example.com	SV497#sv497	student	2026-05-17 02:51:59.464736
1064d123-85c2-4c52-84a1-30eb2410a54e	SV498	Sinh Viên 498	sv498@example.com	SV498#sv498	student	2026-05-17 02:51:59.464736
f9ad9a66-1d90-4a7e-afca-95495ff74616	SV499	Sinh Viên 499	sv499@example.com	SV499#sv499	student	2026-05-17 02:51:59.464736
a35c5fdf-6fae-44e3-9707-3a333eaecb72	SV1000	Sinh Viên 1000	new_1000@example.com	SV1000#new_1000	student	2026-05-17 02:55:45.957306
89e976f6-a3e5-4296-85eb-595054b10caa	SV1001	Sinh Viên 1001	new_1001@example.com	SV1001#new_1001	student	2026-05-17 02:55:45.957306
ada5dfb1-dab2-49a1-a669-d32bdf0cf1a0	SV1002	Sinh Viên 1002	new_1002@example.com	SV1002#new_1002	student	2026-05-17 02:55:45.957306
5eb8e48a-0239-4737-b5c3-7676fb073230	SV1003	Sinh Viên 1003	new_1003@example.com	SV1003#new_1003	student	2026-05-17 02:55:45.957306
21199e89-2987-4dd8-a287-36a7bfc47e3b	SV1004	Sinh Viên 1004	new_1004@example.com	SV1004#new_1004	student	2026-05-17 02:55:45.957306
2d06da9d-734d-4f78-9e38-32b4dce6970f	SV1005	Sinh Viên 1005	new_1005@example.com	SV1005#new_1005	student	2026-05-17 02:55:45.957306
1ddb25bb-becf-438c-bec7-7353630718f2	SV1006	Sinh Viên 1006	new_1006@example.com	SV1006#new_1006	student	2026-05-17 02:55:45.957306
2e0a1895-3af2-49a6-b5c5-c34572d6bdb2	SV1007	Sinh Viên 1007	new_1007@example.com	SV1007#new_1007	student	2026-05-17 02:55:45.957306
e850d11b-5c30-42dc-8fe6-773b2eda3ac3	SV1008	Sinh Viên 1008	new_1008@example.com	SV1008#new_1008	student	2026-05-17 02:55:45.957306
a1466f95-3216-4917-a697-c4310b485e9b	SV1009	Sinh Viên 1009	new_1009@example.com	SV1009#new_1009	student	2026-05-17 02:55:45.957306
f8897cdc-65c4-421c-bab8-5cf5c92eefa1	SV1010	Sinh Viên 1010	new_1010@example.com	SV1010#new_1010	student	2026-05-17 02:55:45.957306
86aa21e7-e6d1-4aa8-b2af-4db3043208e9	SV1011	Sinh Viên 1011	new_1011@example.com	SV1011#new_1011	student	2026-05-17 02:55:45.957306
81767b3e-e32b-4be1-9f6c-e3ebaf6f1c01	SV1012	Sinh Viên 1012	new_1012@example.com	SV1012#new_1012	student	2026-05-17 02:55:45.957306
c709d3ca-0ded-4c19-aa99-a5eac9a50559	SV1013	Sinh Viên 1013	new_1013@example.com	SV1013#new_1013	student	2026-05-17 02:55:45.957306
890c9508-7faa-44b2-a3ad-1ade74a297a6	SV1014	Sinh Viên 1014	new_1014@example.com	SV1014#new_1014	student	2026-05-17 02:55:45.957306
5e23af73-3787-4a77-b422-c3dab40ae97d	SV1015	Sinh Viên 1015	new_1015@example.com	SV1015#new_1015	student	2026-05-17 02:55:45.957306
548b3321-2958-4b23-a68d-f0bdba1b28ba	SV1016	Sinh Viên 1016	new_1016@example.com	SV1016#new_1016	student	2026-05-17 02:55:45.957306
bc6687d5-6dbe-4249-a9fb-aad82eec8f87	SV1017	Sinh Viên 1017	new_1017@example.com	SV1017#new_1017	student	2026-05-17 02:55:45.957306
b4c60d3e-20cb-4622-b9cd-9873c2514cdc	SV1018	Sinh Viên 1018	new_1018@example.com	SV1018#new_1018	student	2026-05-17 02:55:45.957306
309a4a1b-2fda-40d6-8b86-7da544153183	SV1019	Sinh Viên 1019	new_1019@example.com	SV1019#new_1019	student	2026-05-17 02:55:45.957306
e9dcfdb5-9688-4d9b-9ace-8c725d15dde2	SV1020	Sinh Viên 1020	new_1020@example.com	SV1020#new_1020	student	2026-05-17 02:55:45.957306
4a8b2aa4-7aab-4bc7-8fe0-060e04f9b291	SV1021	Sinh Viên 1021	new_1021@example.com	SV1021#new_1021	student	2026-05-17 02:55:45.957306
7df2eae8-72ed-44fc-9a6c-baaffca4884c	SV1022	Sinh Viên 1022	new_1022@example.com	SV1022#new_1022	student	2026-05-17 02:55:45.957306
5387422c-3b4a-4b8a-b0f4-999336d89a3c	SV1023	Sinh Viên 1023	new_1023@example.com	SV1023#new_1023	student	2026-05-17 02:55:45.957306
42866ebc-ce33-4f0c-8410-488389382fff	SV1024	Sinh Viên 1024	new_1024@example.com	SV1024#new_1024	student	2026-05-17 02:55:45.957306
00063025-a1b0-4e21-b2cc-3d6d3bbfac65	SV1025	Sinh Viên 1025	new_1025@example.com	SV1025#new_1025	student	2026-05-17 02:55:45.957306
a979359a-e0bc-44af-878f-7171cbe14151	SV1026	Sinh Viên 1026	new_1026@example.com	SV1026#new_1026	student	2026-05-17 02:55:45.957306
9717f290-aaff-4a94-bde3-1bf8f1dd3948	SV1027	Sinh Viên 1027	new_1027@example.com	SV1027#new_1027	student	2026-05-17 02:55:45.957306
6ea36d8e-b265-4890-a08b-1caa1b674757	SV1028	Sinh Viên 1028	new_1028@example.com	SV1028#new_1028	student	2026-05-17 02:55:45.957306
41287c5e-2ac4-4c38-8621-0f37c7b513c3	SV1029	Sinh Viên 1029	new_1029@example.com	SV1029#new_1029	student	2026-05-17 02:55:45.957306
3d816a5d-909a-4b3b-9365-422e7323a077	SV1030	Sinh Viên 1030	new_1030@example.com	SV1030#new_1030	student	2026-05-17 02:55:45.957306
c99ad0fe-7e48-4f30-90d2-fded65448525	SV1031	Sinh Viên 1031	new_1031@example.com	SV1031#new_1031	student	2026-05-17 02:55:45.957306
d393b988-a15b-46cf-86a6-dccef2ef05bf	SV1033	Sinh Viên 1033	new_1033@example.com	SV1033#new_1033	student	2026-05-17 02:55:45.957306
7167b482-b78c-4eff-8b44-e00518e06b23	SV1034	Sinh Viên 1034	new_1034@example.com	SV1034#new_1034	student	2026-05-17 02:55:45.957306
6db208d5-6f2e-40ab-815f-3e36ceb8337c	SV1035	Sinh Viên 1035	new_1035@example.com	SV1035#new_1035	student	2026-05-17 02:55:45.957306
7fde22a9-0b61-4b79-add5-11a2a7539b7d	SV1036	Sinh Viên 1036	new_1036@example.com	SV1036#new_1036	student	2026-05-17 02:55:45.957306
7e353c55-4685-4af8-ae86-e46bab2d8010	SV1037	Sinh Viên 1037	new_1037@example.com	SV1037#new_1037	student	2026-05-17 02:55:45.957306
fe2e0a85-61bc-48ab-846c-9a808671bf34	SV1038	Sinh Viên 1038	new_1038@example.com	SV1038#new_1038	student	2026-05-17 02:55:45.957306
14572a0d-0f5a-4f5c-ac39-d32a56fcbff2	SV1039	Sinh Viên 1039	new_1039@example.com	SV1039#new_1039	student	2026-05-17 02:55:45.957306
e10b2675-a691-4de2-bde1-84ea74dac5fb	SV1040	Sinh Viên 1040	new_1040@example.com	SV1040#new_1040	student	2026-05-17 02:55:45.957306
1cddd681-d5df-464a-9bff-40ac7d591d45	SV1041	Sinh Viên 1041	new_1041@example.com	SV1041#new_1041	student	2026-05-17 02:55:45.957306
1e07f0d5-b912-4677-941e-43db5e800687	SV1042	Sinh Viên 1042	new_1042@example.com	SV1042#new_1042	student	2026-05-17 02:55:45.957306
21e1ad7c-5c41-4143-b922-8798bfa69122	SV1043	Sinh Viên 1043	new_1043@example.com	SV1043#new_1043	student	2026-05-17 02:55:45.957306
437f81e5-254c-4d1e-9f27-2d4c5f9ba9fd	SV1044	Sinh Viên 1044	new_1044@example.com	SV1044#new_1044	student	2026-05-17 02:55:45.957306
ac4e2337-26cc-4a47-a682-35576301d3f7	SV1045	Sinh Viên 1045	new_1045@example.com	SV1045#new_1045	student	2026-05-17 02:55:45.957306
54bbc9e0-c808-472e-bb9a-15a98554596a	SV1046	Sinh Viên 1046	new_1046@example.com	SV1046#new_1046	student	2026-05-17 02:55:45.957306
56869fee-2990-4178-befc-b4128375527a	SV1047	Sinh Viên 1047	new_1047@example.com	SV1047#new_1047	student	2026-05-17 02:55:45.957306
7aff91fd-18de-423e-82f9-82f5dd872895	SV1048	Sinh Viên 1048	new_1048@example.com	SV1048#new_1048	student	2026-05-17 02:55:45.957306
f07bdc60-2424-45ef-a5f9-42d1190889d1	SV1049	Sinh Viên 1049	new_1049@example.com	SV1049#new_1049	student	2026-05-17 02:55:45.957306
04b8d1a0-1e6f-44f8-8980-6954c787cdf0	SV1032	Sinh Viên 1032	new_1032@example.com	SV1032#new_1032	staff	2026-05-17 02:55:45.957306
\.


--
-- Data for Name: files; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.files (id, user_id, object_key, file_name, status, created_at, mime_type, size, updated_at) FROM stdin;
0e7585d5-ad7a-4a77-a55f-c1e36c33100b	6874d60c-c650-4fcb-82fe-f322cb21ae41	users/6874d60c-c650-4fcb-82fe-f322cb21ae41/original/fd676f45-edd5-489a-9726-968b5583e593.jpg	3.jpg	done	2026-05-16 19:02:59.972074	image/jpeg	673628	2026-05-16 19:03:00.468372+00
eece17a8-d523-469b-9b48-1f3cc23300f0	6874d60c-c650-4fcb-82fe-f322cb21ae41	users/6874d60c-c650-4fcb-82fe-f322cb21ae41/documents/40731107-9b49-4620-b226-8dc4fd7b0e74.csv	mock_users.csv	uploaded	2026-05-15 07:06:04.334819	text/csv	4025	2026-05-15 07:06:04.334819+00
6ef61f8b-0cca-489c-bfe6-aaa444956c76	6874d60c-c650-4fcb-82fe-f322cb21ae41	users/6874d60c-c650-4fcb-82fe-f322cb21ae41/documents/baf770e3-f35a-4bd3-9c75-1e8e8fe0b265.csv	mock_users.csv	uploaded	2026-05-15 07:06:18.337927	text/csv	4025	2026-05-15 07:06:18.337927+00
4204ab1d-3739-4528-ac2b-f78706310395	6874d60c-c650-4fcb-82fe-f322cb21ae41	users/6874d60c-c650-4fcb-82fe-f322cb21ae41/documents/d443c802-8972-431a-8c12-8617c83214bd.csv	mock_users.csv	done	2026-05-15 07:20:07.04025	text/csv	4025	2026-05-15 07:20:08.46311+00
69c59d9f-d0a9-488a-9e9c-0706049ed71e	6874d60c-c650-4fcb-82fe-f322cb21ae41	users/6874d60c-c650-4fcb-82fe-f322cb21ae41/documents/1aab6606-635e-4b64-b261-ae02c99ebab0.csv	mock_users.csv	done	2026-05-15 07:26:49.483886	text/csv	4025	2026-05-15 07:26:50.398056+00
1bb9763a-4bf2-4621-817b-4d4af53a32d6	6874d60c-c650-4fcb-82fe-f322cb21ae41	users/6874d60c-c650-4fcb-82fe-f322cb21ae41/documents/788daff1-b19d-4ca8-8d37-4224313ffb42.csv	mock_users_updated.csv	done	2026-05-15 07:27:54.666488	text/csv	6655	2026-05-15 07:27:55.213372+00
4aa9ee87-e48a-448a-aa28-e76d82da4490	6874d60c-c650-4fcb-82fe-f322cb21ae41	users/6874d60c-c650-4fcb-82fe-f322cb21ae41/documents/4a377699-450c-4050-af84-4373110670b8.csv	mock_users_updated.csv	done	2026-05-15 07:28:07.596296	text/csv	6655	2026-05-15 07:28:08.045938+00
263b152c-7178-46ad-9ce6-e79f3fb96c88	6874d60c-c650-4fcb-82fe-f322cb21ae41	users/6874d60c-c650-4fcb-82fe-f322cb21ae41/original/17aa9c28-4856-4e71-937b-d8c2cb49db42.jpg	1.jpg	done	2026-05-16 19:03:00.572361	image/jpeg	696554	2026-05-16 19:03:00.948074+00
09c73d1f-e2ac-46af-b55a-b18c1cb244cc	6874d60c-c650-4fcb-82fe-f322cb21ae41	users/6874d60c-c650-4fcb-82fe-f322cb21ae41/documents/3b995f3a-60a5-469e-a097-0225ea1720f9.pdf	Workshop 1.pdf	failed	2026-05-16 18:23:24.198079	application/pdf	75516	2026-05-16 18:23:25.60798+00
c6f59a42-6bb9-4dca-9427-1d797b68f892	6874d60c-c650-4fcb-82fe-f322cb21ae41	users/6874d60c-c650-4fcb-82fe-f322cb21ae41/original/7914f63a-5ac6-455b-928a-4dccdf32e523.jpg	34P58PICbfY5KV67BqU4r_PIC2018.jpg	done	2026-05-17 02:43:08.149135	image/jpeg	13448	2026-05-17 02:43:09.069641+00
d0832bb6-6c0c-4b84-8a20-9257293af17c	6874d60c-c650-4fcb-82fe-f322cb21ae41	users/6874d60c-c650-4fcb-82fe-f322cb21ae41/documents/970281dc-b9d2-4092-9eae-94d5d7c8223c.pdf	Workshop 1.pdf	failed	2026-05-16 18:24:12.064845	application/pdf	75516	2026-05-16 18:24:13.256312+00
92181e90-4f88-4d30-88f0-95acd02e14bd	6874d60c-c650-4fcb-82fe-f322cb21ae41	users/6874d60c-c650-4fcb-82fe-f322cb21ae41/original/29398f40-a4ac-4382-b35d-be334bedab50.jpg	34P58PICbfY5KV67BqU4r_PIC2018.jpg	done	2026-05-17 02:47:33.316895	image/jpeg	13448	2026-05-17 02:47:34.281284+00
9866f215-c4a6-4d36-a7ac-5a36687f2c3a	6874d60c-c650-4fcb-82fe-f322cb21ae41	users/6874d60c-c650-4fcb-82fe-f322cb21ae41/documents/ded51359-17ab-4f67-9f76-d2c8d51113e2.pdf	Workshop 1.pdf	failed	2026-05-16 18:27:29.039801	application/pdf	75516	2026-05-16 18:27:30.008996+00
50c1af2b-53f7-4942-ab55-5f6e77e8e795	6874d60c-c650-4fcb-82fe-f322cb21ae41	users/6874d60c-c650-4fcb-82fe-f322cb21ae41/original/6464bf99-fa8f-4390-8e31-3b71f318b017.png	thumb.png	done	2026-05-17 02:47:50.851529	image/png	1433828	2026-05-17 02:47:51.66598+00
029dd706-df9c-4898-b765-813b53c10caf	6874d60c-c650-4fcb-82fe-f322cb21ae41	users/6874d60c-c650-4fcb-82fe-f322cb21ae41/documents/594bc754-1536-4e50-bfe6-5fdee348193f.pdf	Workshop 1.pdf	failed	2026-05-16 18:27:43.3806	application/pdf	75516	2026-05-16 18:27:44.303345+00
64fd9876-11eb-4fca-a7d1-c8234b180a40	6874d60c-c650-4fcb-82fe-f322cb21ae41	users/6874d60c-c650-4fcb-82fe-f322cb21ae41/documents/666e59d6-010a-47c6-93eb-fcbd5265a59e.csv	mock_users.csv	done	2026-05-17 02:51:57.315563	text/csv	4025	2026-05-17 02:51:58.214359+00
f8aa02f6-62ba-42dc-8ae0-4d014289436a	6874d60c-c650-4fcb-82fe-f322cb21ae41	users/6874d60c-c650-4fcb-82fe-f322cb21ae41/documents/7378ba4e-fc1c-40ec-828c-c6d7eead826b.pdf	Workshop 1.pdf	done	2026-05-16 18:30:50.526313	application/pdf	75516	2026-05-16 18:30:55.232244+00
aff54403-61d0-4904-aa8e-4d43b866d067	6874d60c-c650-4fcb-82fe-f322cb21ae41	users/6874d60c-c650-4fcb-82fe-f322cb21ae41/original/4441f19f-44d8-44bf-90af-0f2d34f0edb8.jpg	sodo.jpg	done	2026-05-16 19:02:53.203182	image/jpeg	102825	2026-05-16 19:02:53.655885+00
300cd67b-8a82-49f6-b0e0-d2265685a7af	6874d60c-c650-4fcb-82fe-f322cb21ae41	users/6874d60c-c650-4fcb-82fe-f322cb21ae41/documents/76666368-ef36-4507-9806-07e20dd8ca1f.csv	mock_users_updated.csv	done	2026-05-17 02:55:44.603053	text/csv	6655	2026-05-17 02:55:45.083786+00
0fc895d0-3b1a-4d3f-9998-b7e7b608e7ff	6874d60c-c650-4fcb-82fe-f322cb21ae41	users/6874d60c-c650-4fcb-82fe-f322cb21ae41/documents/2f23a040-828f-495a-9278-4b43398137da.csv	mock_users_updated.csv	done	2026-05-17 02:56:20.460489	text/csv	6655	2026-05-17 02:56:21.265851+00
7f80b257-91fd-4321-8529-f4c4e8ebee8b	6874d60c-c650-4fcb-82fe-f322cb21ae41	users/6874d60c-c650-4fcb-82fe-f322cb21ae41/documents/39c68dd9-e14e-4b4f-958a-fcb151b3fca2.pdf	Workshop 1.pdf	done	2026-05-17 12:16:48.285813	application/pdf	75516	2026-05-17 12:16:53.136187+00
d30549b7-3c78-41b0-8321-4e7cb2db6668	6874d60c-c650-4fcb-82fe-f322cb21ae41	users/6874d60c-c650-4fcb-82fe-f322cb21ae41/documents/36ec08dd-9a98-4c40-8db5-5b27d82f239f.pdf	Workshop 2.pdf	done	2026-05-17 12:09:42.685921	application/pdf	61542	2026-05-17 12:09:46.921652+00
\.


--
-- Data for Name: ai_summaries; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ai_summaries (id, file_id, summary, status, created_at) FROM stdin;
\.


--
-- Data for Name: workshops; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.workshops (id, title, description, capacity, available_seats, price, start_time, end_time, location, created_by, created_at, speaker, room_map_url) FROM stdin;
d9b99d44-2d26-458d-8848-a5357ec8ad1c	KÊT NỐI VIỆC LÀM	<p>MUỐN TÌM VIỆC VỚI NHÀ TUYỂN DỤNG HÃY ĐĂNG KÝ NGAY HÔM NAY</p>	100	91	0	2026-05-15 05:57:00	2026-05-16 05:57:00	VNU	6874d60c-c650-4fcb-82fe-f322cb21ae41	2026-05-14 05:58:14.956103	\N	\N
6fba68f8-8cb0-4c95-a156-4265dc97ad2c	ỨNG DỤNG AI VÀO CÔNG VIỆC VĂN PHÒNG	<p>Bạn muốn đi đầu trong lĩnh vực AI hãy đăng ký tham gia ngay</p>	100	91	0	2026-05-15 05:59:00	2026-05-17 05:59:00	HCMUS	6874d60c-c650-4fcb-82fe-f322cb21ae41	2026-05-14 06:00:18.897627	TRẦN MẠNH HÙNG	\N
3e827877-f615-496c-93cc-7399b89808c9	Ứng dụng AI & Machine Learning trong Phân tích Dữ liệu	<p>Workshop thực hành chuyên sâu về cách ứng dụng trí tuệ nhân tạo và machine learning vào phân tích dữ liệu thực tế. Sinh viên sẽ được hướng dẫn từ cơ bản đến nâng cao, kết hợp lý thuyết và thực hành trên bộ dữ liệu thực.</p><p>Nội dung bao gồm: tổng quan về AI và Machine Learning trong doanh nghiệp hiện đại, các thuật toán ML phổ biến như Regression, Classification, Clustering, xây dựng pipeline xử lý dữ liệu với Python và Scikit-learn, đánh giá và tối ưu mô hình, triển khai mô hình lên production với FastAPI, và thực hành xây dựng mô hình dự đoán giá nhà.</p><p><strong>Lợi ích khi tham gia:</strong></p><ul><li>Hiểu rõ quy trình xây dựng mô hình ML từ đầu đến cuối</li><li>Có sản phẩm thực tế sau workshop</li><li>Kết nối với chuyên gia trong ngành</li><li>Cơ hội thực tập tại các công ty đối tác</li></ul><p><strong>Đối tượng tham gia:</strong> Sinh viên có kiến thức cơ bản về lập trình Python, mang theo laptop cá nhân đã cài đặt sẵn Python 3.10+ và Jupyter Notebook.</p>	35	34	150000	2026-05-20 13:30:00	2026-05-20 16:30:00	Phòng Lab 201, Tòa nhà C	6874d60c-c650-4fcb-82fe-f322cb21ae41	2026-05-16 18:31:43.495979	ThS. Trần Thị Hương	\N
73467985-8bfa-43cc-aec0-561d1c5296fa	Ngày hội việc làm	<p><strong>🚀 WORKSHOP: CHINH PHỤC NHÀ TUYỂN DỤNG IT &amp; AI 2026</strong></p><p>Anh đang cảm thấy con đường career của mình có chút <strong>tắc nghẽn</strong> hay loay hoay tìm những giải pháp <strong>chính</strong> để "lọt vào mắt xanh" các Big Tech? Đừng để bản thân phải "solo" giữa mùa tuyển dụng đầy biến động này nha! 🌊</p><p><strong>🌟 Workshop này có gì hot?</strong></p><ul><li><strong>Upgrade Profile:</strong> Cách để bản CV của anh trông xịn sò và chuyên nghiệp hơn bao giờ hết.</li><li><strong>Bí kíp interview:</strong> Những kỹ năng <strong>chính</strong> để trả lời thật smooth và tự tin trước nhà tuyển dụng.</li><li><strong>Networking cùng Mentor:</strong> Cơ hội "chạm mặt" các tiền bối trong ngành để hóng kinh nghiệm thực chiến.</li></ul><p><strong>📍 Thông tin chi tiết:</strong></p><ul><li>📅 <strong>Thời gian:</strong> 09:00 - 11:30 | Thứ Bảy, Ngày 16/05/2026</li><li>📍 <strong>Địa điểm:</strong> Giảng đường E, Trường Đại học Khoa học Tự nhiên (HCMUS)</li><li>🎟️ <strong>Phí tham dự:</strong> Miễn phí hoàn toàn cho sinh viên</li></ul><p>👉 <strong>Đăng ký ngay tại đây nha:</strong> <a href="http://localhost:5173/profile" rel="noopener noreferrer" target="_blank">Link</a></p><p><em>"Cơ hội xịn thường không đợi ai, anh nhớ nhanh tay giữ chỗ để tụi mình cùng tỏa sáng nhé!"</em> ✨</p>	100	98	10000	2026-04-25 10:12:00	2026-05-25 10:12:00	CS 1	6874d60c-c650-4fcb-82fe-f322cb21ae41	2026-04-29 19:13:25.195262	\N	https://unihub-cdn-worker.buicuong7954.workers.dev/users/6874d60c-c650-4fcb-82fe-f322cb21ae41/processed/large/4441f19f-44d8-44bf-90af-0f2d34f0edb8.webp
099d0fc2-9339-4367-b268-b0f8f9d1b09c	ABc	<p><strong><em><u>adwd</u></em></strong></p>	50	48	5000	2026-05-17 02:47:00	2026-05-21 02:47:00	Cs1	6874d60c-c650-4fcb-82fe-f322cb21ae41	2026-05-17 02:48:11.080366	Mr Abc	https://unihub-cdn-worker.buicuong7954.workers.dev/users/6874d60c-c650-4fcb-82fe-f322cb21ae41/processed/large/29398f40-a4ac-4382-b35d-be334bedab50.webp
2ed4d68e-c5bf-4aa7-83ec-13e0535a40a5	Kỹ năng Lãnh đạo & Quản lý Nhóm Hiệu quả	<p>Workshop này được thiết kế dành cho sinh viên năm 3-4 muốn phát triển kỹ năng lãnh đạo và quản lý nhóm hiệu quả trong môi trường học thuật và doanh nghiệp.</p><p><strong>Nội dung chính:</strong></p><ul><li>Nguyên lý lãnh đạo hiện đại: từ quản lý truyền thống đến lãnh đạo truyền cảm hứng</li><li>Xây dựng và duy trì nhóm làm việc hiệu suất cao</li><li>Kỹ thuật giao tiếp và giải quyết xung đột trong nhóm</li><li>Phương pháp ra quyết định và phân quyền hiệu quả</li><li>Thực hành: mô phỏng tình huống lãnh đạo thực tế</li></ul><p><strong>Lợi ích tham gia:</strong> Nắm vững các mô hình lãnh đạo hiện đại, tự tin điều phối nhóm dự án, phát triển tư duy chiến lược và nhận chứng chỉ tham gia từ nhà trường.</p><p><strong>Đối tượng:</strong> Sinh viên tất cả các ngành, ưu tiên sinh viên năm 3 trở lên.</p>	50	50	0	2026-05-23 08:00:00	2026-05-23 11:00:00	Phòng Hội thảo 402, Tòa nhà A	6874d60c-c650-4fcb-82fe-f322cb21ae41	2026-05-17 12:11:43.797064	TS. Nguyễn Minh Tuấn	\N
\.


--
-- Data for Name: registrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.registrations (id, student_id, workshop_id, status, created_at) FROM stdin;
3e5bbf5a-fd7c-4ce8-8529-f1c22f997074	b50f9517-7ea8-4717-92e3-01cb836ff3b9	099d0fc2-9339-4367-b268-b0f8f9d1b09c	confirmed	2026-05-17 10:28:05.600761
7881aba7-ea18-42af-95cd-d9f9eb298045	b50f9517-7ea8-4717-92e3-01cb836ff3b9	73467985-8bfa-43cc-aec0-561d1c5296fa	confirmed	2026-05-03 11:22:05.951628
a5ab7d6f-9242-4eff-b4f9-739128635b48	cc493556-7d1d-422c-a118-5fb6c75351f3	d9b99d44-2d26-458d-8848-a5357ec8ad1c	confirmed	2026-05-14 08:22:38.951827
987c0ca9-b558-49a2-b238-3073a9c4dfff	cc493556-7d1d-422c-a118-5fb6c75351f3	6fba68f8-8cb0-4c95-a156-4265dc97ad2c	confirmed	2026-05-14 08:23:32.323775
47649d82-e80d-4a98-a9de-ac20ebc3c846	cc493556-7d1d-422c-a118-5fb6c75351f3	73467985-8bfa-43cc-aec0-561d1c5296fa	pending	2026-05-14 08:38:53.696012
64b54ed2-52c1-4784-829d-1d967a1aa991	00a0e4a2-1a2b-4ce2-a258-91e3f5230300	d9b99d44-2d26-458d-8848-a5357ec8ad1c	confirmed	2026-05-14 08:41:03.853035
1a448ab7-d72f-4198-bb7a-5a5dd8220c9d	00a0e4a2-1a2b-4ce2-a258-91e3f5230300	6fba68f8-8cb0-4c95-a156-4265dc97ad2c	confirmed	2026-05-14 08:41:09.314765
1f175552-3b4d-41d7-903e-6d07e18eedbc	0989f67d-ff23-47bb-b2e3-2ff08668e261	6fba68f8-8cb0-4c95-a156-4265dc97ad2c	confirmed	2026-05-14 09:17:48.966572
ffe0b16b-69fb-4afa-b767-1791c6e7cca4	0989f67d-ff23-47bb-b2e3-2ff08668e261	d9b99d44-2d26-458d-8848-a5357ec8ad1c	confirmed	2026-05-14 09:19:12.595196
19a687b0-f701-4634-876e-f0543a74832f	11905e69-d00f-4551-96cb-28f44724707a	d9b99d44-2d26-458d-8848-a5357ec8ad1c	confirmed	2026-05-14 14:01:30.040202
3691a60e-476a-4d4e-8db5-06124a9bf8ff	11905e69-d00f-4551-96cb-28f44724707a	6fba68f8-8cb0-4c95-a156-4265dc97ad2c	confirmed	2026-05-14 14:13:46.650934
c487d591-f15b-4ff7-a623-092ff7d4aad2	e17577a1-2ec7-4dbe-b69c-3ad4d6115156	d9b99d44-2d26-458d-8848-a5357ec8ad1c	confirmed	2026-05-14 14:15:49.788322
c93fc561-6710-4c99-8921-94e743495de7	e17577a1-2ec7-4dbe-b69c-3ad4d6115156	6fba68f8-8cb0-4c95-a156-4265dc97ad2c	confirmed	2026-05-14 14:17:00.930704
a4e9f2d4-fc46-4147-bf3e-981e11b4e7c2	c26903c5-f55c-42e5-8f2e-dd6f8aa47a2f	d9b99d44-2d26-458d-8848-a5357ec8ad1c	confirmed	2026-05-15 03:18:43.833828
e339ac42-3730-4fbc-a5ad-e06524a506c8	c26903c5-f55c-42e5-8f2e-dd6f8aa47a2f	6fba68f8-8cb0-4c95-a156-4265dc97ad2c	confirmed	2026-05-15 03:20:23.475901
c4e9c50c-cef6-44a9-86de-16d3da2221df	36e1ac5f-279f-4623-853b-8b491b31e977	6fba68f8-8cb0-4c95-a156-4265dc97ad2c	confirmed	2026-05-15 03:22:26.796611
d4c6cf82-648c-4240-86b8-959e3c1e9838	36e1ac5f-279f-4623-853b-8b491b31e977	d9b99d44-2d26-458d-8848-a5357ec8ad1c	confirmed	2026-05-15 03:22:38.576436
4f314ba7-2e42-4abc-80f9-87b2e5809c87	b50f9517-7ea8-4717-92e3-01cb836ff3b9	d9b99d44-2d26-458d-8848-a5357ec8ad1c	confirmed	2026-05-16 19:46:36.181315
ca54669a-e8e7-4b17-a7de-fd3c242df336	1007d1de-8bc0-4ab6-be09-335aa8d5b649	d9b99d44-2d26-458d-8848-a5357ec8ad1c	confirmed	2026-05-17 05:31:38.600679
0077d739-6042-4a15-809b-afeb749318a9	1007d1de-8bc0-4ab6-be09-335aa8d5b649	6fba68f8-8cb0-4c95-a156-4265dc97ad2c	confirmed	2026-05-17 05:32:25.877567
7d8d51e1-b4d3-4aed-b00f-1fce441a0019	b50f9517-7ea8-4717-92e3-01cb836ff3b9	6fba68f8-8cb0-4c95-a156-4265dc97ad2c	confirmed	2026-05-17 11:47:13.66746
f7481a9a-c2a5-485b-bf33-bf168e41fd7e	b50f9517-7ea8-4717-92e3-01cb836ff3b9	3e827877-f615-496c-93cc-7399b89808c9	confirmed	2026-05-16 19:17:06.826428
a457a333-a96a-40ff-80a6-57294adea7d0	0099e1fb-72af-4a4b-ad46-69925b40ee5d	099d0fc2-9339-4367-b268-b0f8f9d1b09c	confirmed	2026-05-17 12:07:19.803271
\.


--
-- Data for Name: checkins; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.checkins (id, registration_id, checkin_time, offline_scanned_at, status, created_at, staff_id) FROM stdin;
17ea4e4f-890a-4d28-83cd-0fe015b3cc36	7881aba7-ea18-42af-95cd-d9f9eb298045	2026-05-08 14:22:35.652651	\N	synced	2026-05-08 14:22:35.652651	4600872c-c6cc-49c9-8b1d-8617a8e78867
eaea2a46-f3a9-4235-9e96-3a0e52f27e5a	a5ab7d6f-9242-4eff-b4f9-739128635b48	2026-05-14 08:24:27.29408	\N	synced	2026-05-14 08:24:27.29408	4600872c-c6cc-49c9-8b1d-8617a8e78867
017b6cda-5ea4-4d8d-ae59-02bd1f7b947c	987c0ca9-b558-49a2-b238-3073a9c4dfff	2026-05-14 08:29:08.046988	2026-05-14 08:27:11.905	synced	2026-05-14 08:29:08.046988	4600872c-c6cc-49c9-8b1d-8617a8e78867
853d044e-a3c1-4131-bff1-9cbc5b8da318	64b54ed2-52c1-4784-829d-1d967a1aa991	2026-05-14 08:41:20.757151	\N	synced	2026-05-14 08:41:20.757151	4600872c-c6cc-49c9-8b1d-8617a8e78867
dc4ee75c-56dd-4698-8ff0-62efc5a8894b	1a448ab7-d72f-4198-bb7a-5a5dd8220c9d	2026-05-14 09:06:35.33661	2026-05-14 09:05:16.775	synced	2026-05-14 09:06:35.33661	4600872c-c6cc-49c9-8b1d-8617a8e78867
a41a5c03-abd7-4cf2-a24c-0b54598abae3	ffe0b16b-69fb-4afa-b767-1791c6e7cca4	2026-05-14 09:19:52.717945	2026-05-14 09:19:16.719	synced	2026-05-14 09:19:52.717945	4600872c-c6cc-49c9-8b1d-8617a8e78867
728c2673-c69d-4acd-9316-b72629e3cb70	1f175552-3b4d-41d7-903e-6d07e18eedbc	2026-05-14 09:19:54.035263	2026-05-14 09:19:34.134	synced	2026-05-14 09:19:54.035263	4600872c-c6cc-49c9-8b1d-8617a8e78867
77a315c5-8cb0-44a5-a091-c221aba2d1fa	19a687b0-f701-4634-876e-f0543a74832f	2026-05-14 14:01:50.736835	\N	synced	2026-05-14 14:01:50.736835	4600872c-c6cc-49c9-8b1d-8617a8e78867
ecefe5c2-dfa3-4fbe-a4a2-65fe5dce795e	3691a60e-476a-4d4e-8db5-06124a9bf8ff	2026-05-14 14:13:53.573671	\N	synced	2026-05-14 14:13:53.573671	4600872c-c6cc-49c9-8b1d-8617a8e78867
18312542-2f4f-4f71-887b-daa89734251f	c487d591-f15b-4ff7-a623-092ff7d4aad2	2026-05-14 14:17:55.742409	2026-05-14 14:16:46.279	synced	2026-05-14 14:17:55.742409	4600872c-c6cc-49c9-8b1d-8617a8e78867
1a8c4d2c-b5a1-4a55-8371-c802f1e967d1	c93fc561-6710-4c99-8921-94e743495de7	2026-05-14 14:39:37.80219	\N	synced	2026-05-14 14:39:37.80219	4600872c-c6cc-49c9-8b1d-8617a8e78867
778c8099-c928-40f5-822c-9373f8d867c6	a4e9f2d4-fc46-4147-bf3e-981e11b4e7c2	2026-05-15 03:19:09.330878	\N	synced	2026-05-15 03:19:09.330878	4600872c-c6cc-49c9-8b1d-8617a8e78867
fbe446a8-7d5a-4758-84e1-33d559a70fc1	e339ac42-3730-4fbc-a5ad-e06524a506c8	2026-05-15 03:23:10.970318	2026-05-15 03:21:51.234	synced	2026-05-15 03:23:10.970318	4600872c-c6cc-49c9-8b1d-8617a8e78867
92d273dc-8d51-4ece-88c3-8faeb157be03	c4e9c50c-cef6-44a9-86de-16d3da2221df	2026-05-15 03:23:13.018308	2026-05-15 03:22:31.557	synced	2026-05-15 03:23:13.018308	4600872c-c6cc-49c9-8b1d-8617a8e78867
7d2f39fe-4027-4102-9283-33f1244dca01	d4c6cf82-648c-4240-86b8-959e3c1e9838	2026-05-15 03:23:15.07329	2026-05-15 03:22:52.941	synced	2026-05-15 03:23:15.07329	4600872c-c6cc-49c9-8b1d-8617a8e78867
55911f7a-f845-4eef-a840-18a199f04dfc	ca54669a-e8e7-4b17-a7de-fd3c242df336	2026-05-17 05:32:09.903215	\N	synced	2026-05-17 05:32:09.903215	4600872c-c6cc-49c9-8b1d-8617a8e78867
7ed8ca39-6bc3-4e35-b1a2-0d6b5030257a	0077d739-6042-4a15-809b-afeb749318a9	2026-05-17 05:33:33.605951	2026-05-17 05:33:16.559	synced	2026-05-17 05:33:33.605951	4600872c-c6cc-49c9-8b1d-8617a8e78867
\.


--
-- Data for Name: failed_jobs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.failed_jobs (id, payload, error_message, failed_at, status) FROM stdin;
1	{"data": {"studentId": "b50f9517-7ea8-4717-92e3-01cb836ff3b9", "workshopId": "73467985-8bfa-43cc-aec0-561d1c5296fa", "registrationId": "fa8d3dc9-4409-42f7-9fcf-a8aa940592c1"}, "type": "REGISTRATION_SUCCESS", "timestamp": "2026-05-03T08:32:14.399Z", "retryCount": 3}	Invalid login: 535-5.7.8 Username and Password not accepted. For more information, go to\n535 5.7.8  https://support.google.com/mail/?p=BadCredentials d9443c01a7336-2ba038ae95csm27882055ad.46 - gsmtp	2026-05-03 08:33:11.559433	retried
2	{"data": {"studentId": "b50f9517-7ea8-4717-92e3-01cb836ff3b9", "workshopId": "fcbcd78a-3c01-47a9-910a-9d0d7439cc06", "registrationId": "ed9bfab9-5089-4b78-b3ea-0e74c00d67cb"}, "type": "REGISTRATION_SUCCESS", "timestamp": "2026-05-08T13:54:55.262Z", "retryCount": 3}	Missing credentials for "PLAIN"	2026-05-08 13:55:51.333012	failed
3	{"data": {"studentId": "11905e69-d00f-4551-96cb-28f44724707a", "workshopId": "233f983e-1341-4ad9-837d-cd59ba8296b0", "registrationId": "be34ba6c-f74d-46f6-b125-91dcefc4a135"}, "type": "REGISTRATION_SUCCESS", "timestamp": "2026-05-14T14:13:02.234Z", "retryCount": 3}	Missing credentials for "PLAIN"	2026-05-14 14:13:57.679021	failed
4	{"data": {"studentId": "11905e69-d00f-4551-96cb-28f44724707a", "workshopId": "6fba68f8-8cb0-4c95-a156-4265dc97ad2c", "registrationId": "3691a60e-476a-4d4e-8db5-06124a9bf8ff"}, "type": "REGISTRATION_SUCCESS", "timestamp": "2026-05-14T14:13:47.471Z", "retryCount": 3}	Missing credentials for "PLAIN"	2026-05-14 14:14:42.100658	failed
5	{"data": {"studentId": "e17577a1-2ec7-4dbe-b69c-3ad4d6115156", "workshopId": "d9b99d44-2d26-458d-8848-a5357ec8ad1c", "registrationId": "c487d591-f15b-4ff7-a623-092ff7d4aad2"}, "type": "REGISTRATION_SUCCESS", "timestamp": "2026-05-14T14:15:50.567Z", "retryCount": 3}	Missing credentials for "PLAIN"	2026-05-14 14:16:47.051702	failed
6	{"data": {"studentId": "e17577a1-2ec7-4dbe-b69c-3ad4d6115156", "workshopId": "6fba68f8-8cb0-4c95-a156-4265dc97ad2c", "registrationId": "c93fc561-6710-4c99-8921-94e743495de7"}, "type": "REGISTRATION_SUCCESS", "timestamp": "2026-05-14T14:17:01.667Z", "retryCount": 3}	Missing credentials for "PLAIN"	2026-05-14 14:17:56.532568	failed
7	{"data": {"studentId": "e17577a1-2ec7-4dbe-b69c-3ad4d6115156", "workshopId": "fcbcd78a-3c01-47a9-910a-9d0d7439cc06", "registrationId": "c9270f52-febc-42b1-a814-fb41f9f81d5d"}, "type": "REGISTRATION_SUCCESS", "timestamp": "2026-05-14T14:17:32.836Z", "retryCount": 3}	Missing credentials for "PLAIN"	2026-05-14 14:18:26.935546	failed
8	{"data": {"studentId": "c26903c5-f55c-42e5-8f2e-dd6f8aa47a2f", "workshopId": "d9b99d44-2d26-458d-8848-a5357ec8ad1c", "registrationId": "a4e9f2d4-fc46-4147-bf3e-981e11b4e7c2"}, "type": "REGISTRATION_SUCCESS", "timestamp": "2026-05-15T03:18:44.862Z", "retryCount": 3}	Missing credentials for "PLAIN"	2026-05-15 03:19:41.608215	failed
9	{"data": {"studentId": "c26903c5-f55c-42e5-8f2e-dd6f8aa47a2f", "workshopId": "fcbcd78a-3c01-47a9-910a-9d0d7439cc06", "registrationId": "bcd4a4f3-1b54-4664-8b43-c1052d16c5a8"}, "type": "REGISTRATION_SUCCESS", "timestamp": "2026-05-15T03:19:31.702Z", "retryCount": 3}	Missing credentials for "PLAIN"	2026-05-15 03:20:26.160261	failed
10	{"data": {"studentId": "c26903c5-f55c-42e5-8f2e-dd6f8aa47a2f", "workshopId": "6fba68f8-8cb0-4c95-a156-4265dc97ad2c", "registrationId": "e339ac42-3730-4fbc-a5ad-e06524a506c8"}, "type": "REGISTRATION_SUCCESS", "timestamp": "2026-05-15T03:20:24.752Z", "retryCount": 3}	Missing credentials for "PLAIN"	2026-05-15 03:21:20.558276	failed
11	{"data": {"studentId": "36e1ac5f-279f-4623-853b-8b491b31e977", "workshopId": "6fba68f8-8cb0-4c95-a156-4265dc97ad2c", "registrationId": "c4e9c50c-cef6-44a9-86de-16d3da2221df"}, "type": "REGISTRATION_SUCCESS", "timestamp": "2026-05-15T03:22:27.806Z", "retryCount": 3}	Missing credentials for "PLAIN"	2026-05-15 03:23:22.738646	failed
12	{"data": {"studentId": "36e1ac5f-279f-4623-853b-8b491b31e977", "workshopId": "d9b99d44-2d26-458d-8848-a5357ec8ad1c", "registrationId": "d4c6cf82-648c-4240-86b8-959e3c1e9838"}, "type": "REGISTRATION_SUCCESS", "timestamp": "2026-05-15T03:22:39.753Z", "retryCount": 3}	Missing credentials for "PLAIN"	2026-05-15 03:23:34.594571	failed
13	{"data": {"studentId": "1007d1de-8bc0-4ab6-be09-335aa8d5b649", "workshopId": "d9b99d44-2d26-458d-8848-a5357ec8ad1c", "registrationId": "ca54669a-e8e7-4b17-a7de-fd3c242df336"}, "type": "REGISTRATION_SUCCESS", "timestamp": "2026-05-17T05:31:39.664Z", "retryCount": 3}	Missing credentials for "PLAIN"	2026-05-17 05:32:35.189635	failed
14	{"data": {"studentId": "1007d1de-8bc0-4ab6-be09-335aa8d5b649", "workshopId": "6fba68f8-8cb0-4c95-a156-4265dc97ad2c", "registrationId": "0077d739-6042-4a15-809b-afeb749318a9"}, "type": "REGISTRATION_SUCCESS", "timestamp": "2026-05-17T05:32:27.039Z", "retryCount": 3}	Missing credentials for "PLAIN"	2026-05-17 05:33:22.797364	failed
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (id, user_id, type, content, status, created_at) FROM stdin;
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payments (id, registration_id, amount, status, idempotency_key, created_at, order_code, external_id, checkout_url, description) FROM stdin;
9e2a4912-5f08-4936-9f85-93a569bdff4b	f7481a9a-c2a5-485b-bf33-bf168e41fd7e	150000	paid	\N	2026-05-16 19:36:51.325813	22	572be8e636624831884f03be84bb55ef	https://pay.payos.vn/web/572be8e636624831884f03be84bb55ef	\N
0eb27585-6146-4918-b90d-204069dc4383	7881aba7-ea18-42af-95cd-d9f9eb298045	10000	paid	\N	2026-05-03 11:42:34.593003	6	e624edcf180b4e1397182d320c9b2681	https://pay.payos.vn/web/e624edcf180b4e1397182d320c9b2681	\N
32ae4241-01c7-49c9-a00b-9a6aae0643de	7881aba7-ea18-42af-95cd-d9f9eb298045	10000	paid	\N	2026-05-03 11:58:55.991001	7	bb3104b876c0481f817b5f093b84aef4	https://pay.payos.vn/web/bb3104b876c0481f817b5f093b84aef4	\N
62002ad1-c8f7-4a85-95ae-e4a4fb0a1362	f7481a9a-c2a5-485b-bf33-bf168e41fd7e	150000	failed	\N	2026-05-16 19:46:48.15732	23	6114595ec7214fb09c781444cfa3ea0c	https://pay.payos.vn/web/6114595ec7214fb09c781444cfa3ea0c	\N
6393b592-52d1-4b7a-974c-6b3df3a0cc8e	7881aba7-ea18-42af-95cd-d9f9eb298045	10000	paid	\N	2026-05-03 12:02:16.924089	8	6184157fa40f48f593183e7279c9ba15	https://pay.payos.vn/web/6184157fa40f48f593183e7279c9ba15	\N
7e5fa8b4-f72f-425c-ae3e-30491070b144	7881aba7-ea18-42af-95cd-d9f9eb298045	10000	pending	\N	2026-05-03 12:11:19.613428	10	\N	\N	\N
ec039061-49d3-4d5e-9dc5-c41b8bc7202c	7881aba7-ea18-42af-95cd-d9f9eb298045	10000	pending	\N	2026-05-03 12:16:40.673871	11	\N	\N	\N
bea0852b-b4ab-4f7e-ac8a-a360e6a2ad95	7881aba7-ea18-42af-95cd-d9f9eb298045	10000	pending	\N	2026-05-03 12:21:33.26769	12	\N	\N	\N
195c86b6-9cd9-491e-9729-bb460196f4ff	7881aba7-ea18-42af-95cd-d9f9eb298045	10000	paid	\N	2026-05-03 12:23:57.736028	13	d3201ae46fc94c0c86356ee457aac042	https://pay.payos.vn/web/d3201ae46fc94c0c86356ee457aac042	\N
d084843d-089d-4531-98ad-8e78cd31b159	7881aba7-ea18-42af-95cd-d9f9eb298045	10000	pending	\N	2026-05-03 12:35:11.370564	14	5569091cedcb4e3ba0d1c555afac546a	https://pay.payos.vn/web/5569091cedcb4e3ba0d1c555afac546a	\N
55abf40b-a7f5-4610-8f36-d3470a08c58a	f7481a9a-c2a5-485b-bf33-bf168e41fd7e	150000	paid	\N	2026-05-16 19:47:42.967947	24	8bf37edefc014ed6b0ba00f1794ed2b0	https://pay.payos.vn/web/8bf37edefc014ed6b0ba00f1794ed2b0	\N
24321aeb-59dd-446f-a52f-ca2aa6418bba	7881aba7-ea18-42af-95cd-d9f9eb298045	10000	paid	\N	2026-05-03 12:38:32.967431	15	7d318bfd0803469b9a927a5c625f2904	https://pay.payos.vn/web/7d318bfd0803469b9a927a5c625f2904	\N
b2c81b7f-3444-4bd5-956c-cf097f8722db	7881aba7-ea18-42af-95cd-d9f9eb298045	10000	failed	\N	2026-05-03 12:45:15.375134	16	0b1e58fef4ea435fb5235e42f7c199e8	https://pay.payos.vn/web/0b1e58fef4ea435fb5235e42f7c199e8	\N
82523eab-9171-4540-b6a3-aa080e3f7652	a457a333-a96a-40ff-80a6-57294adea7d0	5000	paid	\N	2026-05-17 12:07:19.803271	32	8a3554ad3f734dbfbb38eeb41467dd04	https://pay.payos.vn/web/8a3554ad3f734dbfbb38eeb41467dd04	\N
f76b0e7d-61e8-4e9b-a5a8-d90b2c8ed4a4	7881aba7-ea18-42af-95cd-d9f9eb298045	10000	paid	\N	2026-05-03 12:45:25.069652	17	f8beb09fcacb40a3b8d0845fcbfcbfac	https://pay.payos.vn/web/f8beb09fcacb40a3b8d0845fcbfcbfac	\N
f6ab7e7b-edfe-43a6-8f85-4b55731d703a	47649d82-e80d-4a98-a9de-ac20ebc3c846	10000	pending	\N	2026-05-14 08:38:53.696012	18	\N	\N	\N
55b493fd-69d7-450f-9851-889763d16e75	3e5bbf5a-fd7c-4ce8-8529-f1c22f997074	5000	paid	\N	2026-05-17 10:28:05.600761	25	c51b6f83e97647aab1410718aced4743	https://pay.payos.vn/web/c51b6f83e97647aab1410718aced4743	\N
75b72a6d-f18c-4b9d-8703-d5339f0a0ff2	f7481a9a-c2a5-485b-bf33-bf168e41fd7e	150000	failed	\N	2026-05-16 19:17:06.826428	19	2da1b99e69c2416d8488ba7bf3b3a95a	https://pay.payos.vn/web/2da1b99e69c2416d8488ba7bf3b3a95a	\N
365f154a-9a3a-497c-ad04-422563b9687b	f7481a9a-c2a5-485b-bf33-bf168e41fd7e	150000	failed	\N	2026-05-16 19:22:34.898119	20	6c928ad50dda4c00a81505f9a18c3341	https://pay.payos.vn/web/6c928ad50dda4c00a81505f9a18c3341	\N
5b6a689d-3ddc-4956-a44f-5e6d4536d4d3	f7481a9a-c2a5-485b-bf33-bf168e41fd7e	150000	paid	\N	2026-05-16 19:26:54.827677	21	736bbc649ae048f68264ee96668d1a66	https://pay.payos.vn/web/736bbc649ae048f68264ee96668d1a66	\N
c82d90f9-6f3f-435d-bf12-76a911d39022	3e5bbf5a-fd7c-4ce8-8529-f1c22f997074	5000	paid	\N	2026-05-17 11:51:53.953234	26	faee3292cfa54eddbc5fd069e126e710	https://pay.payos.vn/web/faee3292cfa54eddbc5fd069e126e710	\N
54d2e4cc-d27a-4c6e-914d-6bab8eeffdfc	3e5bbf5a-fd7c-4ce8-8529-f1c22f997074	5000	paid	\N	2026-05-17 11:53:50.519863	27	16d2c7e9fbea455cb4967f64a14cfcc0	https://pay.payos.vn/web/16d2c7e9fbea455cb4967f64a14cfcc0	\N
fe0ef1f7-3df3-4806-9504-96d2a2e8f846	3e5bbf5a-fd7c-4ce8-8529-f1c22f997074	5000	failed	\N	2026-05-17 12:16:08.200976	33	5cc4f97644ee402fa41ed04a957a5be7	https://pay.payos.vn/web/5cc4f97644ee402fa41ed04a957a5be7	\N
c6605227-cae8-44af-8802-23884b10d83c	3e5bbf5a-fd7c-4ce8-8529-f1c22f997074	5000	paid	\N	2026-05-17 11:58:35.240977	28	210a33d4ab0241ac823e53ef15696a44	https://pay.payos.vn/web/210a33d4ab0241ac823e53ef15696a44	\N
4a08f08b-0d16-419b-b231-a727f8c41cc0	f7481a9a-c2a5-485b-bf33-bf168e41fd7e	150000	paid	\N	2026-05-17 11:59:42.088481	29	3ba9f0f72f444dfcbefed80abb748101	https://pay.payos.vn/web/3ba9f0f72f444dfcbefed80abb748101	\N
6110fa85-6b13-487f-85c9-de3596eb0a76	3e5bbf5a-fd7c-4ce8-8529-f1c22f997074	5000	paid	\N	2026-05-17 12:04:05.134783	30	ccf3adb73ee54436bc2f6dcd867859d4	https://pay.payos.vn/web/ccf3adb73ee54436bc2f6dcd867859d4	\N
671d433a-de85-41d6-b862-c66ed5442852	3e5bbf5a-fd7c-4ce8-8529-f1c22f997074	5000	paid	\N	2026-05-17 12:19:11.933179	34	682dbd8c17bc4b42b79e294eb55a036c	https://pay.payos.vn/web/682dbd8c17bc4b42b79e294eb55a036c	\N
8da11e75-94ae-4124-a14a-1acec4c00519	3e5bbf5a-fd7c-4ce8-8529-f1c22f997074	5000	paid	\N	2026-05-17 12:05:44.130258	31	7b2ad59f576e40998bf8690023fe5d9c	https://pay.payos.vn/web/7b2ad59f576e40998bf8690023fe5d9c	\N
\.


--
-- Data for Name: staging_users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.staging_users (student_code, name, email) FROM stdin;
SV400	Sinh Viên 400	sv400@example.com
SV401	Sinh Viên 401	sv401@example.com
SV402	Sinh Viên 402 (Updated)	sv402@example.com
SV403	Sinh Viên 403	sv403@example.com
SV404	Sinh Viên 404	sv404@example.com
SV405	Sinh Viên 405	sv405@example.com
SV406	Sinh Viên 406	sv406@example.com
SV407	Sinh Viên 407 (Updated)	sv407@example.com
SV408	Sinh Viên 408	sv408@example.com
SV409	Sinh Viên 409	sv409@example.com
SV410	Sinh Viên 410	sv410@example.com
SV411	Sinh Viên 411	sv411@example.com
SV412	Sinh Viên 412 (Updated)	sv412@example.com
SV413	Sinh Viên 413	sv413@example.com
SV414	Sinh Viên 414	sv414@example.com
SV415	Sinh Viên 415	sv415@example.com
SV416	Sinh Viên 416	sv416@example.com
SV417	Sinh Viên 417 (Updated)	sv417@example.com
SV418	Sinh Viên 418 (Updated)	sv418@example.com
SV419	Sinh Viên 419	sv419@example.com
SV420	Sinh Viên 420	sv420@example.com
SV421	Sinh Viên 421	sv421@example.com
SV422	Sinh Viên 422 (Updated)	sv422@example.com
SV423	Sinh Viên 423	sv423@example.com
SV424	Sinh Viên 424 (Updated)	sv424@example.com
SV425	Sinh Viên 425	sv425@example.com
SV426	Sinh Viên 426 (Updated)	sv426@example.com
SV427	Sinh Viên 427 (Updated)	sv427@example.com
SV428	Sinh Viên 428	sv428@example.com
SV429	Sinh Viên 429	sv429@example.com
SV430	Sinh Viên 430 (Updated)	sv430@example.com
SV431	Sinh Viên 431	sv431@example.com
SV432	Sinh Viên 432	sv432@example.com
SV433	Sinh Viên 433 (Updated)	sv433@example.com
SV434	Sinh Viên 434 (Updated)	sv434@example.com
SV435	Sinh Viên 435 (Updated)	sv435@example.com
SV436	Sinh Viên 436	sv436@example.com
SV437	Sinh Viên 437	sv437@example.com
SV438	Sinh Viên 438	sv438@example.com
SV439	Sinh Viên 439 (Updated)	sv439@example.com
SV440	Sinh Viên 440 (Updated)	sv440@example.com
SV441	Sinh Viên 441 (Updated)	sv441@example.com
SV442	Sinh Viên 442	sv442@example.com
SV443	Sinh Viên 443	sv443@example.com
SV444	Sinh Viên 444	sv444@example.com
SV445	Sinh Viên 445	sv445@example.com
SV446	Sinh Viên 446 (Updated)	sv446@example.com
SV447	Sinh Viên 447	sv447@example.com
SV448	Sinh Viên 448	sv448@example.com
SV449	Sinh Viên 449	sv449@example.com
SV450	Sinh Viên 450	sv450@example.com
SV451	Sinh Viên 451 (Updated)	sv451@example.com
SV452	Sinh Viên 452 (Updated)	sv452@example.com
SV453	Sinh Viên 453 (Updated)	sv453@example.com
SV454	Sinh Viên 454	sv454@example.com
SV455	Sinh Viên 455	sv455@example.com
SV456	Sinh Viên 456 (Updated)	sv456@example.com
SV457	Sinh Viên 457	sv457@example.com
SV458	Sinh Viên 458 (Updated)	sv458@example.com
SV459	Sinh Viên 459	sv459@example.com
SV460	Sinh Viên 460 (Updated)	sv460@example.com
SV461	Sinh Viên 461	sv461@example.com
SV462	Sinh Viên 462 (Updated)	sv462@example.com
SV463	Sinh Viên 463	sv463@example.com
SV464	Sinh Viên 464 (Updated)	sv464@example.com
SV465	Sinh Viên 465 (Updated)	sv465@example.com
SV466	Sinh Viên 466	sv466@example.com
SV467	Sinh Viên 467 (Updated)	sv467@example.com
SV468	Sinh Viên 468	sv468@example.com
SV469	Sinh Viên 469	sv469@example.com
SV470	Sinh Viên 470	sv470@example.com
SV471	Sinh Viên 471	sv471@example.com
SV472	Sinh Viên 472	sv472@example.com
SV473	Sinh Viên 473 (Updated)	sv473@example.com
SV474	Sinh Viên 474	sv474@example.com
SV475	Sinh Viên 475	sv475@example.com
SV476	Sinh Viên 476 (Updated)	sv476@example.com
SV477	Sinh Viên 477	sv477@example.com
SV478	Sinh Viên 478	sv478@example.com
SV479	Sinh Viên 479 (Updated)	sv479@example.com
SV480	Sinh Viên 480	sv480@example.com
SV481	Sinh Viên 481	sv481@example.com
SV482	Sinh Viên 482 (Updated)	sv482@example.com
SV483	Sinh Viên 483 (Updated)	sv483@example.com
SV484	Sinh Viên 484	sv484@example.com
SV485	Sinh Viên 485	sv485@example.com
SV486	Sinh Viên 486 (Updated)	sv486@example.com
SV487	Sinh Viên 487 (Updated)	sv487@example.com
SV488	Sinh Viên 488	sv488@example.com
SV489	Sinh Viên 489 (Updated)	sv489@example.com
SV490	Sinh Viên 490 (Updated)	sv490@example.com
SV491	Sinh Viên 491 (Updated)	sv491@example.com
SV492	Sinh Viên 492	sv492@example.com
SV493	Sinh Viên 493 (Updated)	sv493@example.com
SV494	Sinh Viên 494	sv494@example.com
SV495	Sinh Viên 495	sv495@example.com
SV496	Sinh Viên 496	sv496@example.com
SV497	Sinh Viên 497	sv497@example.com
SV498	Sinh Viên 498	sv498@example.com
SV499	Sinh Viên 499	sv499@example.com
SV1000	Sinh Viên 1000	new_1000@example.com
SV1001	Sinh Viên 1001	new_1001@example.com
SV1002	Sinh Viên 1002	new_1002@example.com
SV1003	Sinh Viên 1003	new_1003@example.com
SV1004	Sinh Viên 1004	new_1004@example.com
SV1005	Sinh Viên 1005	new_1005@example.com
SV1006	Sinh Viên 1006	new_1006@example.com
SV1007	Sinh Viên 1007	new_1007@example.com
SV1008	Sinh Viên 1008	new_1008@example.com
SV1009	Sinh Viên 1009	new_1009@example.com
SV1010	Sinh Viên 1010	new_1010@example.com
SV1011	Sinh Viên 1011	new_1011@example.com
SV1012	Sinh Viên 1012	new_1012@example.com
SV1013	Sinh Viên 1013	new_1013@example.com
SV1014	Sinh Viên 1014	new_1014@example.com
SV1015	Sinh Viên 1015	new_1015@example.com
SV1016	Sinh Viên 1016	new_1016@example.com
SV1017	Sinh Viên 1017	new_1017@example.com
SV1018	Sinh Viên 1018	new_1018@example.com
SV1019	Sinh Viên 1019	new_1019@example.com
SV1020	Sinh Viên 1020	new_1020@example.com
SV1021	Sinh Viên 1021	new_1021@example.com
SV1022	Sinh Viên 1022	new_1022@example.com
SV1023	Sinh Viên 1023	new_1023@example.com
SV1024	Sinh Viên 1024	new_1024@example.com
SV1025	Sinh Viên 1025	new_1025@example.com
SV1026	Sinh Viên 1026	new_1026@example.com
SV1027	Sinh Viên 1027	new_1027@example.com
SV1028	Sinh Viên 1028	new_1028@example.com
SV1029	Sinh Viên 1029	new_1029@example.com
SV1030	Sinh Viên 1030	new_1030@example.com
SV1031	Sinh Viên 1031	new_1031@example.com
SV1032	Sinh Viên 1032	new_1032@example.com
SV1033	Sinh Viên 1033	new_1033@example.com
SV1034	Sinh Viên 1034	new_1034@example.com
SV1035	Sinh Viên 1035	new_1035@example.com
SV1036	Sinh Viên 1036	new_1036@example.com
SV1037	Sinh Viên 1037	new_1037@example.com
SV1038	Sinh Viên 1038	new_1038@example.com
SV1039	Sinh Viên 1039	new_1039@example.com
SV1040	Sinh Viên 1040	new_1040@example.com
SV1041	Sinh Viên 1041	new_1041@example.com
SV1042	Sinh Viên 1042	new_1042@example.com
SV1043	Sinh Viên 1043	new_1043@example.com
SV1044	Sinh Viên 1044	new_1044@example.com
SV1045	Sinh Viên 1045	new_1045@example.com
SV1046	Sinh Viên 1046	new_1046@example.com
SV1047	Sinh Viên 1047	new_1047@example.com
SV1048	Sinh Viên 1048	new_1048@example.com
SV1049	Sinh Viên 1049	new_1049@example.com
\.


--
-- Data for Name: sync_jobs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sync_jobs (id, file_key, status, is_immediate, triggered_by, started_at, finished_at, error_message, created_at) FROM stdin;
8d72b072-6f38-48e2-908d-df71133b8f69	users/6874d60c-c650-4fcb-82fe-f322cb21ae41/documents/d443c802-8972-431a-8c12-8617c83214bd.csv	Completed	t	6874d60c-c650-4fcb-82fe-f322cb21ae41	2026-05-15 07:20:09.239471	2026-05-15 07:20:10.208493	\N	2026-05-15 07:20:09.024879
237242d8-25b7-466a-9c50-40c7f5f02ab7	users/6874d60c-c650-4fcb-82fe-f322cb21ae41/documents/1aab6606-635e-4b64-b261-ae02c99ebab0.csv	Completed	t	6874d60c-c650-4fcb-82fe-f322cb21ae41	2026-05-15 07:26:50.626754	2026-05-15 07:26:51.37793	\N	2026-05-15 07:26:50.521771
fcf33baa-6be6-4b4e-bc86-df0178b94b33	users/6874d60c-c650-4fcb-82fe-f322cb21ae41/documents/788daff1-b19d-4ca8-8d37-4224313ffb42.csv	Completed	t	6874d60c-c650-4fcb-82fe-f322cb21ae41	2026-05-15 07:27:55.419908	2026-05-15 07:27:56.174257	\N	2026-05-15 07:27:55.320163
8b3b5917-80e0-4d7c-90bf-ab60ae8cc5cf	users/6874d60c-c650-4fcb-82fe-f322cb21ae41/documents/4a377699-450c-4050-af84-4373110670b8.csv	Pending	f	6874d60c-c650-4fcb-82fe-f322cb21ae41	\N	\N	\N	2026-05-15 07:28:08.15757
f91202fc-5b80-45d0-841a-ca67ef5c618a	users/6874d60c-c650-4fcb-82fe-f322cb21ae41/documents/666e59d6-010a-47c6-93eb-fcbd5265a59e.csv	Completed	t	6874d60c-c650-4fcb-82fe-f322cb21ae41	2026-05-17 02:51:58.824611	2026-05-17 02:51:59.567172	\N	2026-05-17 02:51:58.719366
34b5333e-9493-4d3c-9e45-f2f98d4104c5	users/6874d60c-c650-4fcb-82fe-f322cb21ae41/documents/76666368-ef36-4507-9806-07e20dd8ca1f.csv	Completed	t	6874d60c-c650-4fcb-82fe-f322cb21ae41	2026-05-17 02:55:45.299566	2026-05-17 02:55:46.062137	\N	2026-05-17 02:55:45.19141
a8238728-37b2-4c91-9d50-8444726cf96b	users/6874d60c-c650-4fcb-82fe-f322cb21ae41/documents/2f23a040-828f-495a-9278-4b43398137da.csv	Pending	f	6874d60c-c650-4fcb-82fe-f322cb21ae41	\N	\N	\N	2026-05-17 02:56:21.367049
\.


--
-- Data for Name: workshop_images; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.workshop_images (id, workshop_id, object_key, cdn_url, cdn_thumb, cdn_medium, cdn_large, sort_order, created_at) FROM stdin;
0c409aaf-0416-4d47-aea6-7ba0eba27e31	73467985-8bfa-43cc-aec0-561d1c5296fa	users/6874d60c-c650-4fcb-82fe-f322cb21ae41/original/fd676f45-edd5-489a-9726-968b5583e593.jpg	https://unihub-cdn-worker.buicuong7954.workers.dev/users/6874d60c-c650-4fcb-82fe-f322cb21ae41/original/fd676f45-edd5-489a-9726-968b5583e593.jpg	https://unihub-cdn-worker.buicuong7954.workers.dev/users/6874d60c-c650-4fcb-82fe-f322cb21ae41/processed/thumb/fd676f45-edd5-489a-9726-968b5583e593.webp	https://unihub-cdn-worker.buicuong7954.workers.dev/users/6874d60c-c650-4fcb-82fe-f322cb21ae41/processed/medium/fd676f45-edd5-489a-9726-968b5583e593.webp	https://unihub-cdn-worker.buicuong7954.workers.dev/users/6874d60c-c650-4fcb-82fe-f322cb21ae41/processed/large/fd676f45-edd5-489a-9726-968b5583e593.webp	0	2026-05-16 19:03:01.124292
b7829605-2e5f-4bb4-8611-5c39e66c03f9	73467985-8bfa-43cc-aec0-561d1c5296fa	users/6874d60c-c650-4fcb-82fe-f322cb21ae41/original/17aa9c28-4856-4e71-937b-d8c2cb49db42.jpg	https://unihub-cdn-worker.buicuong7954.workers.dev/users/6874d60c-c650-4fcb-82fe-f322cb21ae41/original/17aa9c28-4856-4e71-937b-d8c2cb49db42.jpg	https://unihub-cdn-worker.buicuong7954.workers.dev/users/6874d60c-c650-4fcb-82fe-f322cb21ae41/processed/thumb/17aa9c28-4856-4e71-937b-d8c2cb49db42.webp	https://unihub-cdn-worker.buicuong7954.workers.dev/users/6874d60c-c650-4fcb-82fe-f322cb21ae41/processed/medium/17aa9c28-4856-4e71-937b-d8c2cb49db42.webp	https://unihub-cdn-worker.buicuong7954.workers.dev/users/6874d60c-c650-4fcb-82fe-f322cb21ae41/processed/large/17aa9c28-4856-4e71-937b-d8c2cb49db42.webp	1	2026-05-16 19:03:01.300155
c8be646d-9135-4bba-b87c-a0937892138e	099d0fc2-9339-4367-b268-b0f8f9d1b09c	users/6874d60c-c650-4fcb-82fe-f322cb21ae41/original/6464bf99-fa8f-4390-8e31-3b71f318b017.png	https://unihub-cdn-worker.buicuong7954.workers.dev/users/6874d60c-c650-4fcb-82fe-f322cb21ae41/original/6464bf99-fa8f-4390-8e31-3b71f318b017.png	https://unihub-cdn-worker.buicuong7954.workers.dev/users/6874d60c-c650-4fcb-82fe-f322cb21ae41/processed/thumb/6464bf99-fa8f-4390-8e31-3b71f318b017.webp	https://unihub-cdn-worker.buicuong7954.workers.dev/users/6874d60c-c650-4fcb-82fe-f322cb21ae41/processed/medium/6464bf99-fa8f-4390-8e31-3b71f318b017.webp	https://unihub-cdn-worker.buicuong7954.workers.dev/users/6874d60c-c650-4fcb-82fe-f322cb21ae41/processed/large/6464bf99-fa8f-4390-8e31-3b71f318b017.webp	0	2026-05-17 02:48:11.689612
\.


--
-- Data for Name: workshop_staffs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.workshop_staffs (id, workshop_id, staff_id, created_at) FROM stdin;
92f53279-9b8e-4c93-b3c0-cfe1beb83e8f	d9b99d44-2d26-458d-8848-a5357ec8ad1c	4600872c-c6cc-49c9-8b1d-8617a8e78867	2026-05-14 05:58:15.292202
0dd77619-9964-4312-9f31-075be7d64253	6fba68f8-8cb0-4c95-a156-4265dc97ad2c	4600872c-c6cc-49c9-8b1d-8617a8e78867	2026-05-14 06:00:19.220367
374ada9d-8408-493f-adf0-844e4c847aa6	73467985-8bfa-43cc-aec0-561d1c5296fa	4600872c-c6cc-49c9-8b1d-8617a8e78867	2026-05-16 19:03:07.788083
26cfcc7b-00ed-4efc-a197-f26477472c7a	099d0fc2-9339-4367-b268-b0f8f9d1b09c	4600872c-c6cc-49c9-8b1d-8617a8e78867	2026-05-17 02:48:11.376108
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.schema_migrations (version, inserted_at) FROM stdin;
20211116024918	2026-04-28 15:48:01
20211116045059	2026-04-28 15:48:02
20211116050929	2026-04-28 15:48:03
20211116051442	2026-04-28 15:48:04
20211116212300	2026-04-28 15:48:05
20211116213355	2026-04-28 15:48:05
20211116213934	2026-04-28 15:48:06
20211116214523	2026-04-28 15:48:07
20211122062447	2026-04-28 15:48:08
20211124070109	2026-04-28 15:48:08
20211202204204	2026-04-28 15:48:09
20211202204605	2026-04-28 15:48:10
20211210212804	2026-04-28 15:48:12
20211228014915	2026-04-28 15:48:12
20220107221237	2026-04-28 15:48:13
20220228202821	2026-04-28 15:48:14
20220312004840	2026-04-28 15:48:14
20220603231003	2026-04-28 15:48:16
20220603232444	2026-04-28 15:48:16
20220615214548	2026-04-28 15:48:17
20220712093339	2026-04-28 15:48:18
20220908172859	2026-04-28 15:48:18
20220916233421	2026-04-28 15:48:19
20230119133233	2026-04-28 15:48:20
20230128025114	2026-04-28 15:48:21
20230128025212	2026-04-28 15:48:21
20230227211149	2026-04-28 15:48:22
20230228184745	2026-04-28 15:48:23
20230308225145	2026-04-28 15:48:23
20230328144023	2026-04-28 15:48:24
20231018144023	2026-04-28 15:48:25
20231204144023	2026-04-28 15:48:26
20231204144024	2026-04-28 15:48:27
20231204144025	2026-04-28 15:48:27
20240108234812	2026-04-28 15:48:28
20240109165339	2026-04-28 15:48:29
20240227174441	2026-04-28 15:48:30
20240311171622	2026-04-28 15:48:31
20240321100241	2026-04-28 15:48:32
20240401105812	2026-04-28 15:48:34
20240418121054	2026-04-28 15:48:35
20240523004032	2026-04-28 15:48:38
20240618124746	2026-04-28 15:48:38
20240801235015	2026-04-28 15:48:39
20240805133720	2026-04-28 15:48:40
20240827160934	2026-04-28 15:48:40
20240919163303	2026-04-28 15:48:41
20240919163305	2026-04-28 15:48:42
20241019105805	2026-04-28 15:48:43
20241030150047	2026-04-28 15:48:45
20241108114728	2026-04-28 15:48:46
20241121104152	2026-04-28 15:48:47
20241130184212	2026-04-28 15:48:48
20241220035512	2026-04-28 15:48:48
20241220123912	2026-04-28 15:48:49
20241224161212	2026-04-28 15:48:50
20250107150512	2026-04-28 15:48:50
20250110162412	2026-04-28 15:48:51
20250123174212	2026-04-28 15:48:52
20250128220012	2026-04-28 15:48:52
20250506224012	2026-04-28 15:48:53
20250523164012	2026-04-28 15:48:54
20250714121412	2026-04-28 15:48:54
20250905041441	2026-04-28 15:48:55
20251103001201	2026-04-28 15:48:56
20251120212548	2026-04-28 15:48:57
20251120215549	2026-04-28 15:48:57
20260218120000	2026-04-28 15:48:58
20260326120000	2026-04-28 15:48:59
\.


--
-- Data for Name: subscription; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.subscription (id, subscription_id, entity, filters, claims, created_at, action_filter) FROM stdin;
\.


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.buckets (id, name, owner, created_at, updated_at, public, avif_autodetection, file_size_limit, allowed_mime_types, owner_id, type) FROM stdin;
\.


--
-- Data for Name: buckets_analytics; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.buckets_analytics (name, type, format, created_at, updated_at, id, deleted_at) FROM stdin;
\.


--
-- Data for Name: buckets_vectors; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.buckets_vectors (id, type, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.migrations (id, name, hash, executed_at) FROM stdin;
0	create-migrations-table	e18db593bcde2aca2a408c4d1100f6abba2195df	2026-04-28 15:46:14.148609
1	initialmigration	6ab16121fbaa08bbd11b712d05f358f9b555d777	2026-04-28 15:46:14.191948
2	storage-schema	f6a1fa2c93cbcd16d4e487b362e45fca157a8dbd	2026-04-28 15:46:14.202533
3	pathtoken-column	2cb1b0004b817b29d5b0a971af16bafeede4b70d	2026-04-28 15:46:14.23339
4	add-migrations-rls	427c5b63fe1c5937495d9c635c263ee7a5905058	2026-04-28 15:46:14.246225
5	add-size-functions	79e081a1455b63666c1294a440f8ad4b1e6a7f84	2026-04-28 15:46:14.253371
6	change-column-name-in-get-size	ded78e2f1b5d7e616117897e6443a925965b30d2	2026-04-28 15:46:14.260803
7	add-rls-to-buckets	e7e7f86adbc51049f341dfe8d30256c1abca17aa	2026-04-28 15:46:14.268037
8	add-public-to-buckets	fd670db39ed65f9d08b01db09d6202503ca2bab3	2026-04-28 15:46:14.275845
9	fix-search-function	af597a1b590c70519b464a4ab3be54490712796b	2026-04-28 15:46:14.283023
10	search-files-search-function	b595f05e92f7e91211af1bbfe9c6a13bb3391e16	2026-04-28 15:46:14.290211
11	add-trigger-to-auto-update-updated_at-column	7425bdb14366d1739fa8a18c83100636d74dcaa2	2026-04-28 15:46:14.297316
12	add-automatic-avif-detection-flag	8e92e1266eb29518b6a4c5313ab8f29dd0d08df9	2026-04-28 15:46:14.304531
13	add-bucket-custom-limits	cce962054138135cd9a8c4bcd531598684b25e7d	2026-04-28 15:46:14.311535
14	use-bytes-for-max-size	941c41b346f9802b411f06f30e972ad4744dad27	2026-04-28 15:46:14.318898
15	add-can-insert-object-function	934146bc38ead475f4ef4b555c524ee5d66799e5	2026-04-28 15:46:14.344755
16	add-version	76debf38d3fd07dcfc747ca49096457d95b1221b	2026-04-28 15:46:14.351877
17	drop-owner-foreign-key	f1cbb288f1b7a4c1eb8c38504b80ae2a0153d101	2026-04-28 15:46:14.358647
18	add_owner_id_column_deprecate_owner	e7a511b379110b08e2f214be852c35414749fe66	2026-04-28 15:46:14.365369
19	alter-default-value-objects-id	02e5e22a78626187e00d173dc45f58fa66a4f043	2026-04-28 15:46:14.373553
20	list-objects-with-delimiter	cd694ae708e51ba82bf012bba00caf4f3b6393b7	2026-04-28 15:46:14.380466
21	s3-multipart-uploads	8c804d4a566c40cd1e4cc5b3725a664a9303657f	2026-04-28 15:46:14.3891
22	s3-multipart-uploads-big-ints	9737dc258d2397953c9953d9b86920b8be0cdb73	2026-04-28 15:46:14.409817
23	optimize-search-function	9d7e604cddc4b56a5422dc68c9313f4a1b6f132c	2026-04-28 15:46:14.423495
24	operation-function	8312e37c2bf9e76bbe841aa5fda889206d2bf8aa	2026-04-28 15:46:14.431145
25	custom-metadata	d974c6057c3db1c1f847afa0e291e6165693b990	2026-04-28 15:46:14.43847
26	objects-prefixes	215cabcb7f78121892a5a2037a09fedf9a1ae322	2026-04-28 15:46:14.447046
27	search-v2	859ba38092ac96eb3964d83bf53ccc0b141663a6	2026-04-28 15:46:14.454071
28	object-bucket-name-sorting	c73a2b5b5d4041e39705814fd3a1b95502d38ce4	2026-04-28 15:46:14.460911
29	create-prefixes	ad2c1207f76703d11a9f9007f821620017a66c21	2026-04-28 15:46:14.467668
30	update-object-levels	2be814ff05c8252fdfdc7cfb4b7f5c7e17f0bed6	2026-04-28 15:46:14.47435
31	objects-level-index	b40367c14c3440ec75f19bbce2d71e914ddd3da0	2026-04-28 15:46:14.481215
32	backward-compatible-index-on-objects	e0c37182b0f7aee3efd823298fb3c76f1042c0f7	2026-04-28 15:46:14.48814
33	backward-compatible-index-on-prefixes	b480e99ed951e0900f033ec4eb34b5bdcb4e3d49	2026-04-28 15:46:14.495479
34	optimize-search-function-v1	ca80a3dc7bfef894df17108785ce29a7fc8ee456	2026-04-28 15:46:14.503203
35	add-insert-trigger-prefixes	458fe0ffd07ec53f5e3ce9df51bfdf4861929ccc	2026-04-28 15:46:14.511016
36	optimise-existing-functions	6ae5fca6af5c55abe95369cd4f93985d1814ca8f	2026-04-28 15:46:14.517958
37	add-bucket-name-length-trigger	3944135b4e3e8b22d6d4cbb568fe3b0b51df15c1	2026-04-28 15:46:14.526596
38	iceberg-catalog-flag-on-buckets	02716b81ceec9705aed84aa1501657095b32e5c5	2026-04-28 15:46:14.535713
39	add-search-v2-sort-support	6706c5f2928846abee18461279799ad12b279b78	2026-04-28 15:46:14.548331
40	fix-prefix-race-conditions-optimized	7ad69982ae2d372b21f48fc4829ae9752c518f6b	2026-04-28 15:46:14.556472
41	add-object-level-update-trigger	07fcf1a22165849b7a029deed059ffcde08d1ae0	2026-04-28 15:46:14.563306
42	rollback-prefix-triggers	771479077764adc09e2ea2043eb627503c034cd4	2026-04-28 15:46:14.569985
43	fix-object-level	84b35d6caca9d937478ad8a797491f38b8c2979f	2026-04-28 15:46:14.576555
44	vector-bucket-type	99c20c0ffd52bb1ff1f32fb992f3b351e3ef8fb3	2026-04-28 15:46:14.583175
45	vector-buckets	049e27196d77a7cb76497a85afae669d8b230953	2026-04-28 15:46:14.590698
46	buckets-objects-grants	fedeb96d60fefd8e02ab3ded9fbde05632f84aed	2026-04-28 15:46:14.602723
47	iceberg-table-metadata	649df56855c24d8b36dd4cc1aeb8251aa9ad42c2	2026-04-28 15:46:14.609966
48	iceberg-catalog-ids	e0e8b460c609b9999ccd0df9ad14294613eed939	2026-04-28 15:46:14.616757
49	buckets-objects-grants-postgres	072b1195d0d5a2f888af6b2302a1938dd94b8b3d	2026-04-28 15:46:14.634146
50	search-v2-optimised	6323ac4f850aa14e7387eb32102869578b5bd478	2026-04-28 15:46:14.641139
51	index-backward-compatible-search	2ee395d433f76e38bcd3856debaf6e0e5b674011	2026-04-28 15:46:14.661998
52	drop-not-used-indexes-and-functions	5cc44c8696749ac11dd0dc37f2a3802075f3a171	2026-04-28 15:46:14.664533
53	drop-index-lower-name	d0cb18777d9e2a98ebe0bc5cc7a42e57ebe41854	2026-04-28 15:46:14.67653
54	drop-index-object-level	6289e048b1472da17c31a7eba1ded625a6457e67	2026-04-28 15:46:14.680417
55	prevent-direct-deletes	262a4798d5e0f2e7c8970232e03ce8be695d5819	2026-04-28 15:46:14.682883
56	fix-optimized-search-function	b823ed1e418101032fa01374edc9a436e54e3ed4	2026-04-28 15:46:14.690668
57	s3-multipart-uploads-metadata	f127886e00d1b374fadbc7c6b31e09336aad5287	2026-04-28 15:46:14.699122
58	operation-ergonomics	00ca5d483b3fe0d522133d9002ccc5df98365120	2026-04-28 15:46:14.70605
59	drop-unused-functions	38456f13e39691c2bbb4b5151d0d1cdbabd4a8c4	2026-04-28 15:46:14.713638
60	optimize-existing-functions-again	db35e1c91a9201e59f4fef8d972c2f277d68b157	2026-04-29 15:51:53.145235
\.


--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.objects (id, bucket_id, name, owner, created_at, updated_at, last_accessed_at, metadata, version, owner_id, user_metadata) FROM stdin;
\.


--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.s3_multipart_uploads (id, in_progress_size, upload_signature, bucket_id, key, version, owner_id, created_at, user_metadata, metadata) FROM stdin;
\.


--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.s3_multipart_uploads_parts (id, upload_id, size, part_number, bucket_id, key, etag, owner_id, version, created_at) FROM stdin;
\.


--
-- Data for Name: vector_indexes; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.vector_indexes (id, name, bucket_id, data_type, dimension, distance_metric, metadata_configuration, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: secrets; Type: TABLE DATA; Schema: vault; Owner: supabase_admin
--

COPY vault.secrets (id, name, description, secret, key_id, nonce, created_at, updated_at) FROM stdin;
\.


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('auth.refresh_tokens_id_seq', 1, false);


--
-- Name: failed_jobs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.failed_jobs_id_seq', 14, true);


--
-- Name: payments_order_code_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.payments_order_code_seq', 34, true);


--
-- Name: subscription_id_seq; Type: SEQUENCE SET; Schema: realtime; Owner: supabase_admin
--

SELECT pg_catalog.setval('realtime.subscription_id_seq', 1, false);


--
-- PostgreSQL database dump complete
--

