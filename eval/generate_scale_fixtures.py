"""Generate 32 scam and 32 benign scripted call transcripts for Kavach scale evaluation.

Strict constraints:
- Synthetic role-play dialogues only.
- ZERO real phone numbers, real Aadhaar, or real PAN.
- Fixed 50/50 dev/test split (never tuned on test).
- Languages: Hindi, Hinglish, English.
- All scam families and adversarial benign categories covered.
"""
from __future__ import annotations

import json
from pathlib import Path

SCAM_SPECS = [
    # 1. Digital Arrest (4 calls: 2 dev, 2 test)
    {
        "id": "scam_digital_arrest_hi_01",
        "family": "digital_arrest",
        "lang": "hi-IN",
        "split": "dev",
        "segments": [
            "Namaste, main CBI headquarter New Delhi se Officer Ajay Verma bol raha hoon.",
            "Aapke Aadhaar card par illegal narcotics aur money laundering ka case register hua hai.",
            "Yeh ek official digital arrest warrant hai, aapko 4 ghante tak video call par rehna hoga, kisi ko mat batana.",
            "Supreme court ka order hai, turant investigation verification ke liye safe account mein paise transfer karo.",
            "Agar aapne abhi paise transfer nahi kiye toh local police aapko 15 minute mein physical arrest kar legi."
        ]
    },
    {
        "id": "scam_digital_arrest_en_02",
        "family": "digital_arrest",
        "lang": "en-IN",
        "split": "dev",
        "segments": [
            "Good afternoon, this is Cyber Crime Department headquarters calling regarding your national identity.",
            "Your identity has been linked to a twenty crore financial fraud and warrant for your arrest is issued.",
            "You are placed under immediate digital arrest under section 144, do not disconnect or inform anyone.",
            "For judicial clearance, transfer the verification penalty immediately to RBI escrow account.",
            "Immediate compliance is required or police team will arrive at your residence."
        ]
    },
    {
        "id": "scam_digital_arrest_hinglish_03",
        "family": "digital_arrest",
        "lang": "hi-IN",
        "split": "test",
        "segments": [
            "Hello, main Mumbai Crime Branch se Inspector Sharma bol raha hoon CBI joint operation se.",
            "Aapke naam se Canara bank mein 15 fake accounts khole gaye hain terror funding ke liye.",
            "Aapka arrest warrant supreme court se nikla hai, stay on video call in a locked room quietly.",
            "Aapko verification ke liye RBI safe treasury account mein paise transfer karna hoga turant.",
            "Transfer confirm hote hi digital clearance certificate issue hoga warna immediate arrest."
        ]
    },
    {
        "id": "scam_digital_arrest_hi_04",
        "family": "digital_arrest",
        "lang": "hi-IN",
        "split": "test",
        "segments": [
            "Sunिए, main Enforcement Directorate ED office New Delhi se bol raha hoon.",
            "Aapke PAN card aur Aadhaar par money laundering case mein non-bailable warrant nikla hai.",
            "Yeh confidential national security investigation hai, kisi family member ko nahi bata sakte.",
            "Aapka bank account freeze hone se pehle verification bond deposit safe account mein transfer kijiye.",
            "Abhi transfer kijiye warna police team aapke ghar dispatch ho chuki hai."
        ]
    },

    # 2. Courier / FedEx Parcel (4 calls: 2 dev, 2 test)
    {
        "id": "scam_courier_fedex_hi_01",
        "family": "courier_fedex",
        "lang": "hi-IN",
        "split": "dev",
        "segments": [
            "Namaskar, FedEx courier customer support se call hai, aapka ek parcel Mumbai airport customs ne hold kiya hai.",
            "Is parcel mein 5 fake passports aur 150 gram illegal narcotics drugs baramad hui hai.",
            "Customs narcotics branch ne aapke khilaf illegal contraband FIR register ki hai.",
            "Customs clearance officer keh rahe hain ki case radd karne ke liye penalty fees transfer karo.",
            "Turant diye gaye account mein customs security deposit transfer kijiye warna arrest tay hai."
        ]
    },
    {
        "id": "scam_courier_fedex_en_02",
        "family": "courier_fedex",
        "lang": "en-IN",
        "split": "dev",
        "segments": [
            "This is DHL International courier services alert regarding your package destined for Thailand.",
            "The parcel contains illegal synthetic drugs and unauthorized ATM debit cards in your name.",
            "Narcotics Control Bureau has initiated criminal proceedings and issued an impound warrant.",
            "To avoid police custody, pay customs clearance verification fee immediately to clearance account.",
            "Transfer the penalty amount within ten minutes or officers will seize your bank accounts."
        ]
    },
    {
        "id": "scam_courier_fedex_hinglish_03",
        "family": "courier_fedex",
        "lang": "hi-IN",
        "split": "test",
        "segments": [
            "Sir apka courier parcel customs clearance mein fas gaya hai narcotics department ke dwara.",
            "Parcel mein illegal MDMA drugs aur banned chemicals paye gaye hain aapke Aadhaar ke saath.",
            "Police verification officer line par hain, aapko digital arrest kiya ja raha hai parcel case mein.",
            "Agar case court nahi bhejna hai toh turant fine transfer karo verification account mein.",
            "Abhi payment transfer karo warna CBI team ghar par raid karegi."
        ]
    },
    {
        "id": "scam_courier_fedex_en_04",
        "family": "courier_fedex",
        "lang": "en-IN",
        "split": "test",
        "segments": [
            "Urgent notice from airport cargo customs department regarding parcel interception.",
            "Your parcel seized with counterfeit currency notes and forged passport documents.",
            "You are facing immediate criminal detention under customs anti-smuggling act.",
            "Transfer five lakh rupees verification bond to avoid non-bailable judicial arrest.",
            "Complete the wire transfer now to avoid immediate police arrival."
        ]
    },

    # 3. KYC / Bank Account Suspension (4 calls: 2 dev, 2 test)
    {
        "id": "scam_kyc_bank_hi_01",
        "family": "kyc_bank",
        "lang": "hi-IN",
        "split": "dev",
        "segments": [
            "Namaskar, State Bank of India customer service head office se verification officer bol raha hoon.",
            "Aapka bank account KYC update na hone ke karan aaj raat 12 baje permanently block ho raha hai.",
            "RBI guidelines ke anusar aapke account ki services aur pension suspend ki ja rahi hai.",
            "Turant account reactivate karne ke liye aapke phone par aaya hua OTP number batayein.",
            "Jaldi OTP share kijiye warna aapka saara paisa freeze ho jayega aur account band hoga."
        ]
    },
    {
        "id": "scam_kyc_bank_en_02",
        "family": "kyc_bank",
        "lang": "en-IN",
        "split": "dev",
        "segments": [
            "Attention HDFC bank customer, your bank account and debit card are suspended due to pending KYC.",
            "Your PAN card verification failed and regulatory block has been placed on your savings account.",
            "To restore your banking privileges, we need your netbanking PIN and 6-digit authentication OTP.",
            "Tell me your OTP right now over the phone to prevent permanent bank blacklisting.",
            "Provide the PIN immediately or your funds will be permanently impounded by bank authorities."
        ]
    },
    {
        "id": "scam_kyc_bank_hinglish_03",
        "family": "kyc_bank",
        "lang": "hi-IN",
        "split": "test",
        "segments": [
            "Hello sir, ICICI bank verification desk se call hai, aapka KYC update pending hai.",
            "Agar abhi KYC nahi hua toh aapka ATM card block ho jayega aur paise nahi nikal payenge.",
            "Bank verification process chal raha hai, aapke mobile par 6 digit ka OTP aaya hoga.",
            "Jaldi se OTP aur apna ATM secret PIN batao taaki account active ho sake.",
            "Agar OTP nahi diya toh account freeze ho jayega aur penalty lagegi."
        ]
    },
    {
        "id": "scam_kyc_bank_hi_04",
        "family": "kyc_bank",
        "lang": "hi-IN",
        "split": "test",
        "segments": [
            "Punjab National Bank helpline desk se call hai, aapka bank khata aadhar se link nahi hai.",
            "Aapka account suspend kar diya gaya hai aur pension transfer ruk gaya hai.",
            "Account unlock karne ke liye turant phone par aaya OTP number batana anivarya hai.",
            "Kripya apna OTP aur login PIN turant bataiye taaki khata unlock ho sake.",
            "Bina OTP ke bank services permanently band ho jayengi."
        ]
    },

    # 4. Electricity Disconnection (4 calls: 2 dev, 2 test)
    {
        "id": "scam_electricity_hi_01",
        "family": "electricity",
        "lang": "hi-IN",
        "split": "dev",
        "segments": [
            "Dear consumer, Bijli vibhag head office se urgent alert message hai.",
            "Aapka pichhle mahine ka bijli bill update nahi hua hai, aaj raat 9:30 baje electricity power disconnect hogi.",
            "Agar light cut nahi karwani hai toh turant electricity officer se baat karein.",
            "Bijli connection bachaane ke liye abhi 1500 rupaye update fees diye gaye number par transfer karo.",
            "Abhi payment transfer kijiye warna power sub station se aapki line kaat di jayegi."
        ]
    },
    {
        "id": "scam_electricity_en_02",
        "family": "electricity",
        "lang": "en-IN",
        "split": "dev",
        "segments": [
            "Urgent notice from Power Distribution Corporation regarding electricity meter connection.",
            "Your electricity power will be disconnected tonight at nine pm due to non-payment of previous invoice.",
            "Electricity officer is on line to stop power disconnection process immediately.",
            "You must pay pending surcharge fee immediately via UPI transfer to our officer account.",
            "Transfer payment right now or electricity meter will be permanently removed by line staff."
        ]
    },
    {
        "id": "scam_electricity_hinglish_03",
        "family": "electricity",
        "lang": "hi-IN",
        "split": "test",
        "segments": [
            "Electricity department alert, aapka bijli connection tonight disconnect hoga bill unpaid hai.",
            "Sub-division power office se line man nikal chuka hai meter kaatne ke liye.",
            "Agar line cut se bachna hai toh turant bijli bill verification charges pay karo.",
            "Abhi diye gaye account par transfer karo turant connection restore ho jayega.",
            "Paise bhejo warna andhere mein rehna padega kal subah tak."
        ]
    },
    {
        "id": "scam_electricity_hi_04",
        "family": "electricity",
        "lang": "hi-IN",
        "split": "test",
        "segments": [
            "Vidyut vitran nigam alert, aapke meter ka bijli bill overdue hai aur disconnection order pass hua hai.",
            "Line inspector 20 minute mein aapke ghar ki power cut karne aa raha hai.",
            "Disconnection rokne ke liye turant verification amount safe portal par transfer kijiye.",
            "Payment abhi transfer karo warna re-connection charge 5000 rupaye dena padega.",
            "Turant paise transfer kijiye line bachaane ke liye."
        ]
    },

    # 5. SIM / TRAI Deactivation (3 calls: 2 dev, 1 test)
    {
        "id": "scam_sim_trai_hi_01",
        "family": "sim_trai",
        "lang": "hi-IN",
        "split": "dev",
        "segments": [
            "Yeh TRAI Department of Telecommunications ka automated notice hai.",
            "Aapka mobile number agle 2 ghante mein permanently block aur terminate kar diya jayega.",
            "Aapke number se 1000 se zyada illegal spam aur threatening calls report hui hain police mein.",
            "Number block hone se rokne ke liye verification fine turant hamare account mein transfer karo.",
            "Abhi transfer kijiye warna aapke saare mobile SIM card police black list mein daal degi."
        ]
    },
    {
        "id": "scam_sim_trai_en_02",
        "family": "sim_trai",
        "lang": "en-IN",
        "split": "dev",
        "segments": [
            "Department of Telecommunications alert: Your cellular SIM card will be deactivated in two hours.",
            "Multiple criminal harassments and unsolicited fraudulent calls traced to your mobile number.",
            "Telecom regulatory authority has ordered permanent cancellation of all telecom services.",
            "To challenge the suspension order, pay mandatory regulatory bond transfer immediately.",
            "Transfer the penalty amount now or SIM card will be shut down and police notified."
        ]
    },
    {
        "id": "scam_sim_trai_hinglish_03",
        "family": "sim_trai",
        "lang": "hi-IN",
        "split": "test",
        "segments": [
            "TRAI head office notice, aapka mobile number 2 hours mein block ho raha hai.",
            "Cyber crime wing ne aapke number ke khilaf complaint lodge ki hai illegal bulk messaging ki.",
            "Agar SIM card chalu rakhna hai toh turant telecom verification security fees pay karo.",
            "Turant paise transfer karo telecom regulatory safe account mein.",
            "Bina payment ke number turant disconnect hoga aur legal action hoga."
        ]
    },

    # 6. Remote Access App (AnyDesk/TeamViewer) (3 calls: 1 dev, 2 test)
    {
        "id": "scam_remote_access_hi_01",
        "family": "remote_access",
        "lang": "hi-IN",
        "split": "dev",
        "segments": [
            "Namaskar, main bank security support se bol raha hoon aapke mobile mein virus alert aaya hai.",
            "Aapke bank account se anauthorized transactions attempt ho rahe hain hacker ke dwara.",
            "Phone protect karne ke liye Play Store se AnyDesk app install kijiye turant.",
            "AnyDesk open kijiye aur screen par dikh raha 9 digit code batao taaki remote support connect karein.",
            "Ab apna bank app open karo aur PIN daal kar account verify karo."
        ]
    },
    {
        "id": "scam_remote_access_en_02",
        "family": "remote_access",
        "lang": "en-IN",
        "split": "test",
        "segments": [
            "Technical security desk calling regarding suspicious unauthorized device access.",
            "Your online banking portal has been infected with Trojan malware.",
            "To scan and clean your device, immediately download TeamViewer QuickSupport from store.",
            "Grant full device screen permissions and give me your access code right now.",
            "Now enter your confidential UPI PIN on the screen to confirm your identity."
        ]
    },
    {
        "id": "scam_remote_access_hinglish_03",
        "family": "remote_access",
        "lang": "hi-IN",
        "split": "test",
        "segments": [
            "Sir apke phone par bank server se security alert hai, Play Store kholiye.",
            "Aap turant QuickSupport ya AnyDesk app download karo phone clean karne ke liye.",
            "App ka number batao aur allow button par click karke screen share accept kijiye.",
            "Ab bank application open karke apna secret PIN aur password enter karo verification ke liye.",
            "Main yahan se screen dekh raha hoon, code type karke confirm kijiye."
        ]
    },

    # 7. Fake Investment / Trading Tips (3 calls: 1 dev, 2 test)
    {
        "id": "scam_investment_hi_01",
        "family": "investment",
        "lang": "hi-IN",
        "split": "dev",
        "segments": [
            "Namaskar madam, VIP institutional stock trading club se senior advisor bol raha hoon.",
            "Hamare exclusive WhatsApp investment group mein daily 300% guaranteed profit return milta hai.",
            "SEBI approved special pre-IPO quota mein guaranteed profit return scheme hai bina kisi risk ke.",
            "Abhi 50,000 rupaye hamare VIP portfolio account mein transfer karo aur shaam ko 2 lakh nikalo.",
            "Jaldi paise transfer kijiye offer sirf agle 10 minute tak valid hai."
        ]
    },
    {
        "id": "scam_investment_en_02",
        "family": "investment",
        "lang": "en-IN",
        "split": "test",
        "segments": [
            "Exclusive invitation from institutional crypto trading syndicate with guaranteed returns.",
            "Our private algorithmic bot generates 500% profit within twenty four hours completely risk free.",
            "You have been selected for direct seed investment opportunity with guaranteed capital backing.",
            "Transfer investment funds of one lakh rupees to the trading deposit wallet now.",
            "Transfer money immediately to secure your spot before registration closes."
        ]
    },
    {
        "id": "scam_investment_hinglish_03",
        "family": "investment",
        "lang": "hi-IN",
        "split": "test",
        "segments": [
            "Hello sir, share market trading tips group se call hai, daily guaranteed profit mil raha hai.",
            "Hamari trading app par paisa lagao aur har din double return kamao guaranteed.",
            "VIP slot book karne ke liye initial token amount hamare account mein transfer karo.",
            "Abhi paise transfer karo aur turant apna profit withdrawal account mein dekho.",
            "Jaldi transfer kijiye warna slot kisi aur ko allot ho jayega."
        ]
    },

    # 8. Sextortion / Video Call Trap (3 calls: 1 dev, 2 test)
    {
        "id": "scam_sextortion_hi_01",
        "family": "sextortion",
        "lang": "hi-IN",
        "split": "dev",
        "segments": [
            "Namaste, main Cyber Crime cell Crime Branch se Inspector bol raha hoon.",
            "Aapka ek objectionable ashleel video call recording social media par upload kiya gaya hai.",
            "YouTube aur Delhi Police Cyber cell mein aapke khilaf pornography complaint darj hui hai.",
            "Video delete karwane aur FIR cancel karne ke liye Delhi Police officer ke account mein paise transfer karo.",
            "Abhi 30,000 rupaye transfer kijiye warna video aapke parivar aur contacts ko send kar diya jayega."
        ]
    },
    {
        "id": "scam_sextortion_en_02",
        "family": "sextortion",
        "lang": "en-IN",
        "split": "test",
        "segments": [
            "This is Cyber Crime Investigation Unit regarding an explicit video recording of you.",
            "A complaint under IT act section 67 has been registered for circulating offensive video footage.",
            "A criminal arrest warrant is being processed to seize all your digital devices.",
            "To remove the video from internet servers and stop arrest, transfer settlement fee right now.",
            "Pay the settlement amount to our officer account immediately or video will be released publicly."
        ]
    },
    {
        "id": "scam_sextortion_hinglish_03",
        "family": "sextortion",
        "lang": "hi-IN",
        "split": "test",
        "segments": [
            "Crime Branch Cyber Cell se call hai, aapka viral video clip hamare paas aaya hai.",
            "Aapka ashleel video YouTube par release hone wala hai aur FIR arrest warrant ready hai.",
            "Agar izzat bachaani hai aur case band karwana hai toh turant fine transfer karo.",
            "Abhi paise transfer kijiye officer ke account mein case file close ho jayegi.",
            "Jaldi transfer karo warna parivar aur dosto ko video send kar denge."
        ]
    },

    # 9. Relative in Distress / Police Custody (4 calls: 2 dev, 2 test)
    {
        "id": "scam_relative_distress_hi_01",
        "family": "relative_distress",
        "lang": "hi-IN",
        "split": "dev",
        "segments": [
            "Uncle ji pranam, main aapke bete Rahul ka dost bol raha hoon bohot badi musibat hai.",
            "Rahul ka car se bohot bura accident ho gaya hai aur police station mein lockup mein band hai.",
            "Police bol rahi hai ki court bhejne se pehle medical bail ke liye turant 50,000 rupaye lagenge.",
            "Rahul ka phone police ne zabt kar liya hai, unhone turant paise transfer karne ko bola hai.",
            "Jaldi is account par paise transfer kijiye warna Rahul ko jail bhej diya jayega."
        ]
    },
    {
        "id": "scam_relative_distress_en_02",
        "family": "relative_distress",
        "lang": "en-IN",
        "split": "dev",
        "segments": [
            "Hello sir, I am calling from city hospital emergency on behalf of your son.",
            "Your son met with a severe highway accident and police have detained him for investigation.",
            "The inspector demands urgent emergency bail deposit before magistrate remand is finalized.",
            "Transfer emergency hospital bail funds immediately to this hospital verification account.",
            "Transfer the money right now, he is in critical state and cannot call you directly."
        ]
    },
    {
        "id": "scam_relative_distress_hinglish_03",
        "family": "relative_distress",
        "lang": "hi-IN",
        "split": "test",
        "segments": [
            "Aunty ji, aapka beta police chowki mein band hai accident case mein.",
            "SHO sahib bol rahe hain agar abhi settlement nahi kiya toh murder case bana denge.",
            "Bete ne bola hai ki mummy ko call karke turant paise transfer karwao.",
            "Jaldi se 40,000 rupaye is UPI ID par transfer karo taaki beta chhut sake.",
            "Bina der kiye transfer karo warna lockup mein maar padegi."
        ]
    },
    {
        "id": "scam_relative_distress_hi_04",
        "family": "relative_distress",
        "lang": "hi-IN",
        "split": "test",
        "segments": [
            "Namaste Sharma ji, main police thane se sub-inspector bol raha hoon.",
            "Aapka pota illegal fight case mein pakda gaya hai aur jail custody mein hai.",
            "Bache ka career kharab hone se bachana hai toh judge se pehle bail deposit transfer karo.",
            "Turant diye gaye number par paise transfer kijiye taaki use bina case ke chhod sakein.",
            "Jaldi payment transfer kijiye warna media aa jayegi."
        ]
    },

    # 10. Direct OTP / PIN Extraction (3 calls: 1 dev, 2 test)
    {
        "id": "scam_otp_pin_hi_01",
        "family": "otp_pin",
        "lang": "hi-IN",
        "split": "dev",
        "segments": [
            "Namaskar, main credit card verification department se bol raha hoon.",
            "Aapke credit card ke reward points expire ho rahe hain jiska 10,000 rupaye cashback mil raha hai.",
            "Cashback direct account mein transfer karne ke liye mobile par aaya OTP aur CVV batayein.",
            "Apna OTP aur UPI PIN turant share kijiye taaki paise credit ho sakein.",
            "Jaldi OTP batao warna cashback lapse ho jayega."
        ]
    },
    {
        "id": "scam_otp_pin_en_02",
        "family": "otp_pin",
        "lang": "en-IN",
        "split": "test",
        "segments": [
            "Good day, this is Telecom billing center calling regarding your pending bill refund.",
            "You have excess balance of twelve thousand rupees due for direct bank transfer refund.",
            "To confirm the refund transaction, read out your one time password OTP received right now.",
            "Share your OTP and debit card PIN immediately to complete the credit clearance.",
            "Tell me the OTP now or refund authorization will be cancelled permanently."
        ]
    },
    {
        "id": "scam_otp_pin_hinglish_03",
        "family": "otp_pin",
        "lang": "hi-IN",
        "split": "test",
        "segments": [
            "Sir aapka lottery prize 25 lakh rupaye KBC lucky draw mein nikla hai.",
            "Prize money aapke bank account mein transfer karne ke liye registration confirm karna hai.",
            "Aapke phone par 6 digit ka OTP code aaya hoga, jaldi se batao.",
            "Apna OTP aur ATM PIN share karo taaki 25 lakh turant transfer ho sakein.",
            "Jaldi code batao warna prize cancel ho jayega."
        ]
    },
]

BENIGN_SPECS = [
    # 1. Genuine Bank Security Advisory (Adversarial Benign: mentions bank, OTP, fraud, CBI, cyber)
    {
        "id": "benign_bank_advisory_hi_01",
        "category": "bank_advisory",
        "lang": "hi-IN",
        "split": "dev",
        "segments": [
            "Namaskar, yeh State Bank of India ki jan-hit mein jaari suraksha advisory hai.",
            "Aaj kal Cyber fraud aur digital arrest ke fake calls chal rahe hain jahan log CBI ya police bante hain.",
            "Kripya dhyan dein ki Bank kabhi bhi aapka OTP, PIN ya password phone par nahi poochta.",
            "Kabhi bhi kisi anjaan vyakti ke kehne par safe account mein paise transfer na karein.",
            "Kisi bhi sandigdh call par turant 1930 ya cybercrime portal par report karein."
        ]
    },
    {
        "id": "benign_bank_advisory_en_02",
        "category": "bank_advisory",
        "lang": "en-IN",
        "split": "dev",
        "segments": [
            "Dear customer, this is an official security awareness message from your trusted bank.",
            "Fraudsters frequently impersonate police, customs or CBI officers threatening digital arrest.",
            "Please remember: bank officials will never ask for your confidential OTP, CVV, or ATM PIN.",
            "Never share your OTP with anyone claiming to update your KYC or verify your accounts.",
            "Stay safe, stay vigilant, and report suspicious calls immediately to the 1930 national helpline."
        ]
    },
    {
        "id": "benign_bank_advisory_hinglish_03",
        "category": "bank_advisory",
        "lang": "hi-IN",
        "split": "test",
        "segments": [
            "Bank advisory: Savitri ji namaste, HDFC bank se public security awareness call hai.",
            "Online banking fraud se bachein. Koi bhi vyakti agar CBI ya police bankar paise mange toh mana karein.",
            "Apna OTP kisi ko na dein. We will never ask for your secret PIN or netbanking credentials.",
            "Aapka bank account bilkul safe hai, kisi fake notice se darne ki zaroorat nahi hai.",
            "Surakshit rahein aur official bank branch mein jakar hi zaroori kaam karein."
        ]
    },
    {
        "id": "benign_bank_advisory_en_04",
        "category": "bank_advisory",
        "lang": "en-IN",
        "split": "test",
        "segments": [
            "Official banking advisory: Beware of fraudulent scams threatening electricity disconnection or court warrants.",
            "Legitimate organizations will never demand immediate money transfers over WhatsApp or video calls.",
            "Never share your OTP or UPI PIN under any circumstance. Our staff will never request passwords.",
            "If someone claims your parcel contains illegal goods, do not panic, contact local police station.",
            "Protect your hard earned savings by verifying directly at your home branch."
        ]
    },

    # 2. Genuine Courier Delivery (Adversarial: mentions parcel, courier, OTP for delivery confirmation)
    {
        "id": "benign_courier_delivery_hi_01",
        "category": "courier_delivery",
        "lang": "hi-IN",
        "split": "dev",
        "segments": [
            "Namaste sir, main Amazon delivery boy bol raha hoon, aapka ek parcel aaya hai.",
            "Main aapke apartment ke main gate par khada hoon, security guard ko parcel de raha hoon.",
            "Delivery complete karne ke liye delivery boy app mein OTP verify karna padega.",
            "Aapke phone par delivery verification ka OTP aaya hoga, kripya delivery OTP 4582 bata dijiye.",
            "Theek hai sir, parcel security guard ko hand over kar diya hai, dhanyavaad."
        ]
    },
    {
        "id": "benign_courier_delivery_en_02",
        "category": "courier_delivery",
        "lang": "en-IN",
        "split": "dev",
        "segments": [
            "Hello madam, Flipkart courier delivery partner here with your grocery order.",
            "I have arrived at your building entrance and ringing the door bell.",
            "Could you please share the 4-digit package delivery OTP sent via SMS to verify receipt?",
            "Thank you madam, order delivered successfully at your door step.",
            "Have a pleasant day ahead and thank you for shopping with Flipkart."
        ]
    },
    {
        "id": "benign_courier_delivery_hinglish_03",
        "category": "courier_delivery",
        "lang": "hi-IN",
        "split": "test",
        "segments": [
            "Bhaiya main BlueDart courier se bol raha hoon, apka medicine parcel hai.",
            "Aap ghar par hain ya neighbor ke paas de doon parcel?",
            "Delivery verify karne ke liye bas 4 digit delivery OTP bata dijiye.",
            "Shukriya bhaiya, parcel packet gate par receive ho gaya hai.",
            "Aap check kar lijiye packet sealed hai."
        ]
    },
    {
        "id": "benign_courier_delivery_hi_04",
        "category": "courier_delivery",
        "lang": "hi-IN",
        "split": "test",
        "segments": [
            "Namaste, Delhivery parcel service se call hai, aapka book packet aaya hai.",
            "Guard bol raha hai aap teesri floor par rehte hain, main upar aa raha hoon.",
            "Packet lene ke baad delivery confirmation code bata dijiyega.",
            "Dhanyavaad uncle ji, packet aapke hath mein de diya hai.",
            "Shubh din."
        ]
    },

    # 3. Doctor Consultation & Medical Follow-up (Adversarial: mentions prescription, clinic fees, transfer)
    {
        "id": "benign_doctor_clinic_hi_01",
        "category": "doctor_clinic",
        "lang": "hi-IN",
        "split": "dev",
        "segments": [
            "Namaste Verma ji, main Dr. Gupta ke clinic se nurse Neha bol rahi hoon.",
            "Aapki kal ki blood test report Dr. Gupta ne check kar li hai, sugar levels ab control mein hain.",
            "Doctor ne aapki nayi BP medicine prescription WhatsApp par send kar di hai.",
            "Clinic consultation fees clinic counter par transfer kar dena jab aap next checkup ke liye aao.",
            "Dawaein time se lena shuru kijiye aur namak kam rakhiye khane mein."
        ]
    },
    {
        "id": "benign_doctor_clinic_en_02",
        "category": "doctor_clinic",
        "lang": "en-IN",
        "split": "dev",
        "segments": [
            "Good morning Mr. Patel, calling from City Cardiology Hospital reception.",
            "Doctor reviewed your routine ECG test and everything appears completely normal.",
            "Please continue your prescribed multivitamin tablet once daily after breakfast.",
            "The routine follow-up consultation charges can be settled at the billing desk during your visit.",
            "Take care and feel free to reach out if you experience any fatigue."
        ]
    },
    {
        "id": "benign_doctor_clinic_hinglish_03",
        "category": "doctor_clinic",
        "lang": "hi-IN",
        "split": "test",
        "segments": [
            "Hello aunty ji, Apollo pharmacy se chemist bol raha hoon.",
            "Aapki monthly diabetes medicines packet pack ho gayi hai.",
            "Total 850 rupaye ka bill bana hai, jab delivery boy aaye tab cash ya UPI se transfer kar dena.",
            "Insulin fridge mein store kijiyega aur expiry date check kar li hai.",
            "Take care aunty ji."
        ]
    },
    {
        "id": "benign_doctor_clinic_en_04",
        "category": "doctor_clinic",
        "lang": "en-IN",
        "split": "test",
        "segments": [
            "Hello Dr. Rao dental clinic here confirming your dental cleaning appointment for tomorrow at 4 PM.",
            "Please carry your previous dental X-ray film if convenient.",
            "No special advance preparation is required for routine scaling and polishing.",
            "Consultation fee of five hundred can be paid at clinic reception desk.",
            "See you tomorrow afternoon."
        ]
    },

    # 4. Family Money & Everyday Routine (Adversarial: mentions transfer, paise, account, bank)
    {
        "id": "benign_family_money_hi_01",
        "category": "family_money",
        "lang": "hi-IN",
        "split": "dev",
        "segments": [
            "Mummy pranam, main office se nikal gaya hoon aur ghar aa raha hoon.",
            "Maine grocery aur ration ke liye aapke savings account mein 5000 rupaye UPI se transfer kar diye hain.",
            "Kal subah sabzi wale ko usme se cash de dena aur doodh wale ka hisaab clear kar dena.",
            "Mausi ji ka phone aaya tha, wo keh rahi thi Sunday ko lunch par aayengi.",
            "Main rasgulla le kar aa raha hoon raste se, dhyan rakhna apna."
        ]
    },
    {
        "id": "benign_family_money_en_02",
        "category": "family_money",
        "lang": "en-IN",
        "split": "dev",
        "segments": [
            "Hi Dad, just checking in to see how you and Mom are doing this evening.",
            "I transferred the electricity and water utility payment directly through my netbanking portal.",
            "Also sent three thousand to your account for your morning yoga class fee.",
            "Let me know if you need any help booking the train tickets to visit grandmother next week.",
            "Have dinner on time and give my love to Mom."
        ]
    },
    {
        "id": "benign_family_money_hinglish_03",
        "category": "family_money",
        "lang": "hi-IN",
        "split": "test",
        "segments": [
            "Dadi ji namaste, Rohit bol raha hoon college hostel se.",
            "Mera semester exam bohot accha gaya, first division aayega is baar.",
            "Papa ne books khareedne ke liye paise transfer kar diye hain mere account mein.",
            "Aapki tabiyat kaisi hai ab? Dawai time par le rahi hain na?",
            "Next month chhuttiyon mein ghar aaunga toh aapke hath ke laddoo khaaunga."
        ]
    },
    {
        "id": "benign_family_money_hi_04",
        "category": "family_money",
        "lang": "hi-IN",
        "split": "test",
        "segments": [
            "Beta pranam, Sharma ji ke bete ki shaadi ka card aaya tha ghar par.",
            "Shagun ke lifaafe ke liye 2100 rupaye bank se nikal kar rakh liye hain maine.",
            "Tum shaam ko jaldi aa jaana toh hum dono saath mein jaayenge function mein.",
            "Chai bana kar rakhi hai tumhare aane tak.",
            "Aaram se gaadi chalana."
        ]
    },

    # 5. Police Tenant Verification / Local Community (Adversarial: mentions police, verification, thana, aadhaar)
    {
        "id": "benign_police_tenant_hi_01",
        "category": "police_tenant",
        "lang": "hi-IN",
        "split": "dev",
        "segments": [
            "Namaste Sharma ji, main local beat constable Suresh bol raha hoon Mayur Vihar thane se.",
            "Aapne jo second floor par naye tenant kirayedaar ka verification form submit kiya tha wo check ho gaya hai.",
            "Unka Aadhaar card aur company ID card record par verify ho gaya hai koi issue nahi hai.",
            "Jab bhi time mile aap thane ke front desk se verified stamped slip collect kar lijiyega.",
            "Chowki mein sab theek hai, dhanyavaad Sharma ji."
        ]
    },
    {
        "id": "benign_police_tenant_en_02",
        "category": "police_tenant",
        "lang": "en-IN",
        "split": "dev",
        "segments": [
            "Good day sir, this is Sub-Inspector Patel from Indiranagar local police station.",
            "We are conducting the routine annual resident welfare community verification survey.",
            "Could you confirm if the security cameras at the lane entrance gate are functioning properly?",
            "Please ensure night watchman registers all visitor vehicles in the society logbook.",
            "Thank you for cooperating with the community policing initiative."
        ]
    },
    {
        "id": "benign_police_tenant_hinglish_03",
        "category": "police_tenant",
        "lang": "hi-IN",
        "split": "test",
        "segments": [
            "Namaste uncle ji, main RWA society office se Ramesh bol raha hoon.",
            "Police verification camp lag raha hai Sunday ko society clubhouse mein domestic helpers ke liye.",
            "Agar aapki maid ya driver ka verification pending hai toh Aadhaar copy ke saath bhej dijiyega.",
            "Form free of cost hai society residents ke liye.",
            "Aapke floor ke guard ko information de di hai."
        ]
    },
    {
        "id": "benign_police_tenant_hi_04",
        "category": "police_tenant",
        "lang": "hi-IN",
        "split": "test",
        "segments": [
            "Sharma ji pranam, chowki incharge sahab ne senior citizen helpline register check kiya hai.",
            "Har mahine hum colony ke senior citizens ka haal-chaal poochte hain suraksha ke liye.",
            "Colony mein koi sandigdh anjaan vyakti toh nahi dikha pichhle dino?",
            "Emergency ke liye beat constable ka direct number aapke fridge par chipka hua hai.",
            "Surakshit rahein aur shubh din."
        ]
    },

    # 6. IT / Broadband Tech Support (Adversarial: mentions WiFi, router, technical support, restart)
    {
        "id": "benign_tech_support_hi_01",
        "category": "tech_support",
        "lang": "hi-IN",
        "split": "dev",
        "segments": [
            "Namaskar, Airtel broadband customer care support se technician bol raha hoon.",
            "Aapne internet speed slow hone ki complaint register karwayi thi ticket number 4921.",
            "Humne backend se optic fiber line reset kar di hai.",
            "Kripya apne WiFi router ko peeche se 10 second ke liye off karke on kijiye.",
            "Speed ab 100 Mbps aa rahi hai, check karke confirm kar dijiye."
        ]
    },
    {
        "id": "benign_tech_support_en_02",
        "category": "tech_support",
        "lang": "en-IN",
        "split": "dev",
        "segments": [
            "Hello sir, calling from JioFiber technical assistance desk regarding your home connection.",
            "Our automated diagnostic detected intermittent signal attenuation on your area line.",
            "Our line engineer is inspecting the neighborhood junction distribution box.",
            "No action required from your end, your broadband internet will remain operational.",
            "Thank you for your patience and support."
        ]
    },
    {
        "id": "benign_tech_support_hinglish_03",
        "category": "tech_support",
        "lang": "hi-IN",
        "split": "test",
        "segments": [
            "Sir Tata Play fiber se call hai, routine line maintenance complete ho gaya hai.",
            "Aapka set top box aur WiFi connection smoothly chal raha hai na?",
            "Agar koi channel change karne mein dikkat ho toh remote ka reset button press kijiye.",
            "Thank you for choosing Tata Play, have a great evening."
        ]
    },

    # 7. Routine Utility Reminder (Adversarial: mentions electricity bill, due date, portal)
    {
        "id": "benign_utility_reminder_hi_01",
        "category": "utility_reminder",
        "lang": "hi-IN",
        "split": "dev",
        "segments": [
            "Namaskar, BSES Yamuna power distribution se automated informational reminder hai.",
            "Aapke electricity bill ka due date 25 October hai, amount 1,420 rupaye hai.",
            "Kripya bill ka bhugtan hamesha official BSES website ya authorized payment center se karein.",
            "Kisi bhi anjaan number par bill payment ke liye paise transfer na karein.",
            "On time payment par aapko 10 rupaye ka digital discount milega."
        ]
    },
    {
        "id": "benign_utility_reminder_en_02",
        "category": "utility_reminder",
        "lang": "en-IN",
        "split": "test",
        "segments": [
            "Good day, water supply board automated advisory regarding municipal water meter reading.",
            "Your bi-monthly municipal consumption invoice of 380 rupees is generated.",
            "Payment can be made through official government portal e-Seva or at your ward office.",
            "Beware of fake SMS messages demanding urgent payments.",
            "Thank you for conserving water in our neighborhood."
        ]
    },

    # 8. Genuine Mutual Fund / Banking Investment (Adversarial: mentions investment, mutual fund, SIP, bank)
    {
        "id": "benign_mutual_fund_hi_01",
        "category": "mutual_fund",
        "lang": "hi-IN",
        "split": "dev",
        "segments": [
            "Namaste Sharma ji, main aapke home branch Bank of Baroda se branch manager bol raha hoon.",
            "Aapka fixed deposit agle hafte mature ho raha hai, auto-renewal ke baare mein discuss karna tha.",
            "Senior citizen FD par bank 7.75 percent interest rate offer kar raha hai jo bohot safe aur guaranteed hai.",
            "Aap aaram se branch aakar naye FD certificate par sign kar dijiyega jab bhi suvidha ho.",
            "Chai peete hain branch mein milkar, shubh din."
        ]
    },
    {
        "id": "benign_mutual_fund_en_02",
        "category": "mutual_fund",
        "lang": "en-IN",
        "split": "test",
        "segments": [
            "Good morning Mr. Nair, relationship manager calling from UTI Mutual Funds.",
            "Reviewing your retirement SIP portfolio, your index equity funds are performing steadily.",
            "We recommend maintaining your diversified asset allocation without making hasty switches.",
            "All dividend payouts are credited directly to your registered bank savings account.",
            "Let me know if you would like an updated annual capital gains statement mailed."
        ]
    },

    # 9. Telecom Store Visit (Adversarial: mentions SIM, upgrade, TRAI, KYC)
    {
        "id": "benign_telecom_store_hi_01",
        "category": "telecom_store",
        "lang": "hi-IN",
        "split": "dev",
        "segments": [
            "Namaskar, main Jio Store Sector 18 se customer care representative bol raha hoon.",
            "Aapka 4G SIM card ko free mein 5G SIM mein upgrade karne ki suvidha available hai.",
            "Iske liye aapko koi paise nahi dene hain aur na hi koi OTP phone par share karna hai.",
            "Jab bhi aap market aaiye, original Aadhaar card lekar Jio Store par aakar free SIM le sakte hain.",
            "Phone par kisi ko bhi SIM upgrade ke naam par OTP na batayein."
        ]
    },
    {
        "id": "benign_telecom_store_en_02",
        "category": "telecom_store",
        "lang": "en-IN",
        "split": "test",
        "segments": [
            "Hello, Airtel customer service informing you about our new international roaming pack.",
            "If you have upcoming overseas travel, you can activate roaming directly from the official Airtel Thanks app.",
            "No manual paperwork or document submission is needed.",
            "Thank you for being a valued Airtel subscriber."
        ]
    },

    # 10. Office Expense Reimbursement (Adversarial: mentions account, transfer, reimbursement, finance)
    {
        "id": "benign_reimbursement_hi_01",
        "category": "reimbursement",
        "lang": "hi-IN",
        "split": "dev",
        "segments": [
            "Sir namaste, finance department se account officer bol raha hoon.",
            "Aapka pichhle mahine ka travel aur medical allowance bill verify ho gaya hai.",
            "Total 8,500 rupaye ka reimbursement aapke salary account mein company ne transfer kar diya hai.",
            "Bank credit slip aur voucher statement aapke official email par bhej diya hai maine.",
            "Aap check kar lijiye koi difference ho toh batana."
        ]
    },
    {
        "id": "benign_reimbursement_en_02",
        "category": "reimbursement",
        "lang": "en-IN",
        "split": "test",
        "segments": [
            "Hi sir, HR payroll operations calling to confirm your pension gratuity adjustment.",
            "The arrears statement has been cleared by audit and credited to your State Bank pension account.",
            "No further documentation or signature is required.",
            "Your revised pension slip is available for download on the employee web portal.",
            "Best regards and enjoy your retirement."
        ]
    },
]


def main():
    out_dir = Path("eval/fixtures")
    out_dir.mkdir(parents=True, exist_ok=True)

    count_scam = 0
    count_benign = 0

    for s in SCAM_SPECS:
        path = out_dir / f"{s['id']}.json"
        data = {
            "id": s["id"],
            "label": "scam",
            "family": s["family"],
            "lang": s["lang"],
            "split": s["split"],
            "segments": [{"text": t, "t": round(i * 6.5, 1)} for i, t in enumerate(s["segments"])]
        }
        path.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")
        count_scam += 1

    for b in BENIGN_SPECS:
        path = out_dir / f"{b['id']}.json"
        data = {
            "id": b["id"],
            "label": "benign",
            "family": b["category"],
            "lang": b["lang"],
            "split": b["split"],
            "segments": [{"text": t, "t": round(i * 6.5, 1)} for i, t in enumerate(b["segments"])]
        }
        path.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")
        count_benign += 1

    print(f"Generated {count_scam} scam fixtures and {count_benign} benign fixtures in {out_dir}")


if __name__ == "__main__":
    main()
