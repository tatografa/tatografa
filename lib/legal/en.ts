import { OPERADOR, type Documento } from "./documentos";

/**
 * Termos e política em inglês — **tradução de referência** (decisão do Otávio,
 * 05/10). A página avisa no topo que a versão que vale é a em português.
 *
 * Segue o texto de `termos.ts` e `privacidade.ts` seção por seção, na mesma
 * ordem e com as mesmas âncoras: mudou lá, muda aqui. "Personal" vira
 * "trainer" e "aluno" vira "client", as palavras da landing em inglês; o
 * personal é "they", porque o texto não sabe quem ele é.
 */
export const TERMOS_EN: Documento = {
  slug: "termos",
  titulo: "Terms of use",
  resumo:
    "The rules for using Reps Club: what we provide, and what is up to you and your trainer.",
  secoes: [
    {
      titulo: "What Reps Club is",
      paragrafos: [
        "A tool where personal trainers build workouts and clients log what they did — load and reps, set by set. There is also a feed, where clients can post a workout to their own trainer or to the trainer's other clients. Nothing more than that.",
        `The service is run by ${OPERADOR.nome}. To reach us: ${OPERADOR.contato}.`,
      ],
    },
    {
      titulo: "Who is responsible for the workout",
      paragrafos: [
        "**Your trainer.** They assess you and decide the exercises, the loads and the reps. Reps Club only stores and shows what they built — it doesn't choose, doesn't suggest loads, doesn't correct technique and doesn't replace in-person coaching.",
        "**Reps Club is not a health service.** We don't give medical, nutritional or training advice. No number shown here is a recommendation: it is a record of what already happened.",
        "Before starting or changing an exercise program, see a doctor. If you feel pain, dizziness or anything unusual during a workout, stop and get help. That decision is yours and your trainer's, not the app's.",
      ],
    },
    {
      titulo: "Your account",
      paragrafos: [
        "Clients join by invitation from their trainer. Trainers create their own account.",
        "Your password is yours and is not to be shared — whoever signs in with it sees and changes what is yours. If you suspect someone accessed your account, change your password and let us know.",
        "You are responsible for what you enter. Wrong data in your profile leads to the wrong workout.",
      ],
    },
    {
      titulo: "What is not allowed",
      paragrafos: [
        "Using someone else's account, or trying to see data of someone who isn't your client.",
        "Trying to get around the system's access rules, overloading the service or automating mass use.",
        "Using Reps Club for anything illegal, or to prescribe workouts without being qualified to do so.",
        "In the feed: posting a photo of another person without their knowledge and consent, nudity, offensive or discriminatory content, advertising, or prescribing workouts to someone who isn't your client.",
        "Accounts that do any of these things are closed, without prior notice when there is a risk to another person.",
      ],
    },
    {
      titulo: "Your data and your content",
      paragrafos: [
        "The workout your trainer builds is theirs. The history of what you did is yours. Neither belongs to us: we store it for you, and the privacy policy explains who it is shared with.",
        "Two profile fields are written **only by the client**, and not even the trainer can change them: the weight goal and the hormone profile (natural, replacement therapy or hormone use). This isn't a screen rule — the database refuses it. The hormone profile is health data, and recording an assumption about someone else's body as if it were fact is exactly what this lock prevents.",
        "We don't use your content for any other purpose, we don't sell it and we don't publish it.",
      ],
    },
    {
      titulo: "What you post in the feed",
      paragrafos: [
        "**The photo and the text remain yours.** You only give us permission to store and show them to whoever you chose in the post itself — only your trainer, or also their other clients. Nothing goes to the open internet, and this permission ends when you delete the post.",
        "**You are responsible for what you post.** A photo of another person only with their consent. This matters especially at the gym, where people end up in the background of the frame.",
        `**Only you can delete your post.** Your trainer can comment, but can't delete it. If someone posts something that breaks these rules, let us know at ${OPERADOR.contato} — whoever runs Reps Club can remove the content and, if needed, close the account.`,
        "**The feed is optional.** You can use all of Reps Club without posting anything and without ever opening the tab.",
      ],
    },
    {
      titulo: "Availability",
      paragrafos: [
        "Reps Club is in a pilot phase. This means it may go offline, change how it works or lose features without long notice. We do our best not to lose what you logged, but we don't promise continuous availability during this phase.",
        "The app partly works without internet: the sets you confirm are kept on the device and upload when the signal returns. If you clear your browser data before that, whatever hasn't uploaded is lost — which is why the app shows on screen how many sets are still waiting to be sent.",
      ],
    },
    {
      titulo: "Closing your account",
      paragrafos: [
        `You can close it whenever you want: ask your trainer or write to ${OPERADOR.contato}. We delete everything within 30 days.`,
        "We can also close yours, with notice, if the service is discontinued or if these terms are broken.",
      ],
    },
    {
      titulo: "Limits of our responsibility",
      paragrafos: [
        "We are not responsible for injuries, for training results, or for decisions made based on what is in the app — that is between you and your trainer.",
        "We are also not responsible for the service being unavailable during this pilot phase. Nothing here removes the rights that the Brazilian Consumer Protection Code (Código de Defesa do Consumidor) gives you.",
      ],
    },
    {
      titulo: "Changes and jurisdiction",
      paragrafos: [
        "If these terms change in a relevant way, we let you know in the app and ask for your acceptance again. The version date is at the bottom of this page.",
        "Brazilian law applies. The courts of your place of residence are chosen to settle whatever can't be settled by talking.",
      ],
    },
  ],
};

export const PRIVACIDADE_EN: Documento = {
  slug: "privacidade",
  titulo: "Privacy policy",
  resumo:
    "What Reps Club keeps about you, what it is for, who sees it and how to ask us to delete it.",
  secoes: [
    {
      titulo: "The summary, in five lines",
      paragrafos: [
        "We keep what you enter when signing up and what you log while training. It is used to build your workout and show your progress — nothing more.",
        "Your trainer sees your data. No other client sees your workout, your history, your profile or your reassessment measurements and photos.",
        "**The exception is what you post in the feed**, and only that: each post has its own choice of who sees it — only your trainer, or also their other clients. Nothing from Reps Club goes to the open internet.",
        "We don't sell anything to anyone, we don't use your data for ads and we don't train artificial intelligence with it.",
        `You can delete a post instantly, and ask to see, correct or delete everything, at any time: ${OPERADOR.contato}.`,
      ],
    },
    {
      titulo: "What data we collect",
      paragrafos: [
        "**To create your account:** name, email and password. The password is stored encrypted, and not even we can read it.",
        "**That you enter on your first access:** date of birth, weight, height, goal (build muscle, lose fat, conditioning or health) and experience level.",
        "**That you can add to your profile, if you want:** phone number with area code, city and state, a weight goal and whether you use any hormone therapy (natural, replacement therapy or hormone use). **All four are optional and stay blank until you fill them in** — no screen in the app stops working without them. The phone number lets your trainer reach you on WhatsApp, which is where that conversation already happens; the weight goal draws the progress bar that only you and your trainer see. **The last two are written by you, and only you:** the database refuses the write if it doesn't come from your account, even when it is your trainer who tries.",
        "**That comes from your training:** the workouts your trainer built for you and, for each set you log, the load, the reps, whether you skipped the set, when the session started and ended and how long it lasted.",
        "**That you post, if you want:** photo, caption and comments in the feed, plus the record of which posts you liked. Posting is optional from start to finish — you can use all of Reps Club without ever opening the feed.",
        "**That you fill in on a reassessment, if you want:** weight, body fat percentage, arm, chest, waist, hip and thigh measurements, a note of your own, and up to three photos of you — front, side and back. Your trainer opens the form; filling it in is your choice, field by field, and the reassessment can be sent without any photo.",
        "**That your trainer writes about your coaching:** on your file, they have a space for notes — an injury, an exercise preference, the reason for a missed session, whatever they need to remember to build your next workout. **These notes belong to your trainer and you don't see them in the app**, just as a trainer's paper file was always theirs. They are still data about you: if you want to know what is written there, ask your trainer or write to " + OPERADOR.contato + ", and we delete them along with your account.",
        "**Nothing beyond that.** We don't ask for ID documents, a full address, a card or your device location — the app never accesses GPS. Phone and city only exist if you type them. We don't use tracking cookies or any advertising tool.",
      ],
    },
    {
      titulo: "This is health data",
      paragrafos: [
        "Weight, height and date of birth, together with what you lift, say things about your body. A workout photo, even more. **Reassessment measurements and photos are the strongest case of all**: they are a picture of your body, made to be compared with the one from three months ago. Brazilian law (LGPD) calls this **sensitive personal data** and requires greater care — including your explicit consent, which is what you give when you accept this policy on your first access.",
        "**Information about hormone therapy is the most direct case of this.** It isn't inferred from anything: it is a question about your health, which is why it is optional, blank by default and can go back to “not informed” at any time from your profile. It is seen by you and your trainer, nobody else, and it exists for one reason only — the body responds to training differently, and whoever builds your workout decides better knowing it. If you'd rather not say, don't: no screen asks for it, and nothing in the product stops working.",
        "Consent given is consent that can be withdrawn. If you withdraw it, the account is closed, because without this data the product has nothing to do.",
      ],
    },
    {
      titulo: "The feed photo",
      paragrafos: [
        "**You choose who sees it, post by post**, and the choice is on screen before you post: “only your trainer” or “your trainer and their other clients”. There is no option that sends the photo beyond that. Reps Club has no public profile, no shareable link and doesn't show up in search.",
        "**The database checks it, not the screen.** The permission on the photo file follows the same rule as the post: whoever can't see the post can't open the image, even with its address in hand. The photo sits in closed storage and is only served through a temporary link, issued on the spot to whoever has permission.",
        "**The photo that leaves your phone is a reduced copy.** Before uploading, the app shrinks the image and re-encodes it. This discards the metadata the camera saves with it — **including where the photo was taken**, which never reaches us. The original file never leaves your device.",
        "**You delete it whenever you want**, on the post screen itself. The photo leaves Reps Club and the comments go with it. Your trainer can comment on your post, but can't delete it.",
        "**We don't use your photos for anything else.** They don't appear in promotion, aren't shown to other trainers and don't feed any artificial intelligence model.",
        "One thing that depends on you: posting to the group is posting to real people, who can see the image on their screens. If a post is meant to stay between you and your trainer, choose “only your trainer” — it is the one already selected.",
      ],
    },
    {
      titulo: "Reassessment photos and measurements",
      paragrafos: [
        "**Only you and your trainer.** No other client sees your reassessment — not the measurements, not the photos, not the note —, and there is no audience choice here, unlike the feed. A reassessment **never** becomes a post: they are separate screens, and nothing passes from one to the other.",
        "**The database checks it, not the screen.** The photos sit in closed storage, separate from the feed's storage, and are only served through a temporary link issued on the spot to you or your trainer. Whoever isn't one of you two can't open the image, even with its address in hand.",
        "**The photo that leaves your phone is a reduced copy**, like the feed's: the app shrinks and re-encodes the image before uploading, which discards the camera metadata — **including where the photo was taken**. The original file never leaves your device.",
        "**You delete the photos whenever you want**, on the reassessment screen itself, even after sending. They leave Reps Club and your trainer no longer sees them.",
        `**Once sent, the numbers stay.** Weight, measurements and note no longer change, and this is on purpose: they exist to be compared with the next reassessment, and a value rewritten after being read would make your trainer follow progress that didn't happen. If you want to delete a whole reassessment, it is a request like any other: write to ${OPERADOR.contato}.`,
        "**Filling it in is optional, field by field.** Your trainer opens the form and sees what you answered; they don't write any measurement in your place.",
      ],
    },
    {
      titulo: "What we use it for",
      paragrafos: [
        "For your trainer to build and adjust your workout. For you to see your history, your records and your progress per exercise. For the app to know which workout to suggest today. To show in the feed what you posted, to whoever you chose. To compare your reassessment with the previous one, and show that comparison to you and your trainer.",
        "We don't use your data for any other purpose. If that ever changes, we will ask for your permission again first — not through a notice hidden in an update.",
      ],
    },
    {
      titulo: "Who sees your data",
      paragrafos: [
        "**Your trainer**, the same one who invited you: sees your profile, your workouts, your whole training history, your reassessments — measurements and photos — and everything you post in the feed, including posts marked “only your trainer”. That is the point of the product — they need it to train you.",
        "**The notes your trainer makes about you stay with them.** No other client, no other trainer and no client outside the group sees them — and neither do you, on screen. The database checks this, on every query, like everything else.",
        "**Your trainer's other clients**, and only them, see the posts you marked for the group: the photo, the caption, the comments and the like count. Nothing else of yours: not your profile, weight, workout, history or reassessment. You also see the posts they marked for the group.",
        "**No other trainer**, and no client outside your group, sees anything of yours — including group posts. This isn't a promise: it is a rule in the database, checked on every query.",
        "**Whoever runs Reps Club**, to keep the service running and answer your requests.",
        "**Supabase**, the company that hosts the database and the photos, and **Vercel**, which hosts the website. They store the data so the service works; they don't use it for anything of their own. The database is in a Brazil region (São Paulo).",
        "Changing trainers? Whoever invites you sets up the link, and your history goes with you — it is yours.",
      ],
    },
    {
      titulo: "How long we keep it",
      paragrafos: [
        "For as long as your account exists. Your training history is only valuable because it is long: deleting last year would delete your progress.",
        "Posts and photos stay until you delete the post. Once deleted, it's gone — along with its likes and comments.",
        "Reassessment photos stay until you delete them, on the reassessment screen. Measurements stay while the account exists: the history is what gives the comparison meaning.",
        "When you ask to delete your account, we delete everything within 30 days — profile, workouts, every logged set, your posts, your reassessments, all your photos and the notes your trainer made about you. We keep no copy after that.",
      ],
    },
    {
      titulo: "Your rights",
      paragrafos: [
        "The LGPD gives you the right to know what we have about you, correct what is wrong, ask for a copy and ask for deletion. Also to withdraw consent and to know who we share it with.",
        "You already do much of this yourself in the app: your profile and history are all there, the profile is editable, every post has a delete button, and so do the photos of each reassessment.",
        "**The exception is your trainer's notes about your coaching**, which don't appear on any of your screens. They exist, they are data about you, and your right to know what is written there still holds — it just isn't a button, it is a request: talk to your trainer, or write to " + OPERADOR.contato + ".",
        `For everything else — a copy of everything or account deletion —, ask your trainer or write to ${OPERADOR.contato}. We answer within 15 days.`,
        "If you are not satisfied, you can file a complaint with the ANPD, Brazil's national data protection authority.",
      ],
    },
    {
      titulo: "Security",
      paragrafos: [
        "Access is by password, and all traffic is encrypted. In the database, every row has a rule for who can read and write it, checked by the database itself on every query — not by screen code, which is where this kind of rule usually fails. Photos follow the same logic: the permission on a feed file mirrors the post's, and a reassessment photo's reaches only you and your trainer.",
        "No system is perfect. If there is a leak that could put you at risk, we notify you and the ANPD.",
      ],
    },
    {
      titulo: "Cookies",
      ancora: "cookies",
      paragrafos: [
        "**We only use essential cookies**, without which the site doesn't work: the one that keeps you signed in, the one that remembers whether you collapsed the dashboard sidebar, the one that remembers the language you chose for the site and the one that stores your answer to the cookie notice. They don't ask for permission, because turning them off would turn off sign-in.",
        "**Usage-measurement cookies** — the ones that count visits and show how the site is used — **are only used if you accept** in the notice on the home page. Today Reps Club uses none; if it ever does, they will only load for people who accepted. **Advertising cookies, never.**",
        "Not a cookie, but similar: during a workout, the client app keeps on the device itself the sets that haven't reached the server yet and which exercise you are on, so the workout isn't lost when the gym's internet drops. This stays only on your phone, and is erased when the sets are sent and the workout ends.",
        "To change your choice, use the **“Cookies”** link in the home page footer: the notice comes back and you answer again.",
      ],
    },
    {
      titulo: "If you joined the list on the website",
      ancora: "contato-pelo-site",
      paragrafos: [
        "The home page has one way to reach us, for people who **don't use** Reps Club yet: **“Join the list”**. It keeps your email and whether you were on the trainers' or the clients' version of the page — nothing else.",
        "**It serves one purpose only: our team writing to you** by email. It doesn't become an account, doesn't go into an advertising list, isn't passed on to anyone — not even to a trainer, unless you ask — and isn't shown to any app user. Whoever runs Reps Club is who reads it.",
        `To see, correct or delete what you sent, write to ${OPERADOR.contato}. We delete it within 15 days.`,
      ],
    },
    {
      titulo: "Minors",
      paragrafos: [
        "Reps Club is for people over 18. Anyone under 18 can only use it with the consent of their legal guardian, given to the trainer who invites them.",
      ],
    },
    {
      titulo: "Changes to this policy",
      paragrafos: [
        "If we change what we collect, what for, who we share it with or how long we keep it, we let you know in the app and ask for your acceptance again. The version date is at the bottom of this page, and we keep a record of which version you accepted and when.",
        "**Changed on September 14, 2026:** the feed. You can now post a photo and caption, choosing for each post whether it stays only with your trainer or also with their other clients. Before, nothing of yours was visible to another client — which is why we asked for your acceptance again.",
      ],
    },
  ],
};
