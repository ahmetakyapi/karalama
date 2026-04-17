import { LegalLayout } from '@/components/ui/LegalLayout';

export const metadata = {
  title: 'Gizlilik Politikası',
  description:
    'Karalama gizlilik politikası — hangi verileri topluyoruz, nasıl saklıyoruz, ne kadar süre tutuyoruz.',
  alternates: { canonical: '/gizlilik' },
};

const H2 = (props: { children: React.ReactNode }) => (
  <h2 className="text-2xl font-bold text-slate-100 mt-10 mb-3 tracking-tight">
    {props.children}
  </h2>
);

export default function PrivacyPage() {
  return (
    <LegalLayout title="Gizlilik Politikası" updated="18 Nisan 2026">
      <p>
        Karalama (&quot;biz&quot;, &quot;hizmet&quot;) tarayıcı tabanlı
        bir çizim ve tahmin oyunudur. Bu politika, oynarken hangi verilerin
        işlendiğini sade bir dille açıklar.
      </p>

      <H2>Ne topluyoruz</H2>
      <ul className="list-disc list-inside space-y-2">
        <li>
          <strong className="text-slate-100">Oyuncu adı ve avatar rengi:</strong>{' '}
          Sadece sen girdiğinde. Oyun bittiğinde veya odadan ayrıldığında
          sunucu tarafında silinir.
        </li>
        <li>
          <strong className="text-slate-100">Sohbet mesajları ve çizim verisi:</strong>{' '}
          Oda aktifken kısa süre bellekte tutulur, oda kapanınca silinir.
          Kayıt edilmez, arşivlenmez.
        </li>
        <li>
          <strong className="text-slate-100">Tarayıcıda saklanan bilgiler:</strong>{' '}
          Ad/avatar tercihlerin, başarı kilit açma verilerin ve
          erişilebilirlik ayarların <em>sadece kendi tarayıcında</em>{' '}
          (localStorage) tutulur. Bize gönderilmez.
        </li>
        <li>
          <strong className="text-slate-100">Teknik günlükler:</strong>{' '}
          Bağlantı zamanı ve IP hash&apos;i kısa süreli debug amacıyla
          tutulabilir. Kimliği çözmüyoruz, üçüncü taraflarla paylaşmıyoruz.
        </li>
      </ul>

      <H2>Ne toplamıyoruz</H2>
      <ul className="list-disc list-inside space-y-2">
        <li>E-posta, telefon, gerçek isim — hiçbiri.</li>
        <li>Kayıt/parola sistemi yok.</li>
        <li>Reklam takibi, fingerprint, third-party cookie yok.</li>
        <li>Analitik yüklemiyoruz.</li>
      </ul>

      <H2>Çerez kullanımı</H2>
      <p>
        Karalama çerez kullanmaz. Tercihlerin için tarayıcının localStorage
        alanını kullanırız, bu alan sadece senin tarayıcında durur.
      </p>

      <H2>Saklama süresi</H2>
      <p>
        Oda verileri oyun süresince bellekte tutulur ve sen veya son
        oyuncu ayrıldığında silinir. Sohbet mesajları ve çizimler{' '}
        <strong className="text-slate-100">kalıcı olarak kaydedilmez</strong>.
      </p>

      <H2>Haklar (KVKK)</H2>
      <p>
        6698 sayılı KVKK kapsamında kişisel verin işlenmişse bilgi alma,
        silme ve düzeltme haklarına sahipsin. Pratikte biz kalıcı veri
        tutmadığımız için silinecek bir kayıt genelde olmuyor, ama yine
        de talebini aşağıdaki iletişim kanalından iletebilirsin.
      </p>

      <H2>Çocuklar</H2>
      <p>
        Karalama 13 yaş altı kullanıcılar için tasarlanmamıştır. 13 yaş
        altıysan ebeveyn gözetiminde oynamalısın.
      </p>

      <H2>Değişiklikler</H2>
      <p>
        Bu politikayı güncellediğimizde bu sayfadaki &quot;Son güncelleme&quot;
        tarihini yenileriz. Önemli değişiklikleri ana sayfada duyururuz.
      </p>

      <H2>İletişim</H2>
      <p>
        Soru veya talebin için GitHub üzerinden issue açabilir ya da proje
        sorumlusuyla iletişime geçebilirsin.
      </p>
    </LegalLayout>
  );
}
