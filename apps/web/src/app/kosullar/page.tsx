import { LegalLayout } from '@/components/ui/LegalLayout';

export const metadata = {
  title: 'Kullanım Koşulları',
  description:
    'Karalama kullanım koşulları — hizmeti kullanırken uyman gereken kurallar ve sorumluluk sınırları.',
  alternates: { canonical: '/kosullar' },
};

const H2 = (props: { children: React.ReactNode }) => (
  <h2 className="text-2xl font-bold text-slate-100 mt-10 mb-3 tracking-tight">
    {props.children}
  </h2>
);

export default function TermsPage() {
  return (
    <LegalLayout title="Kullanım Koşulları" updated="18 Nisan 2026">
      <p>
        Karalama&apos;yı kullanarak bu koşulları kabul etmiş olursun.
        Koşulları okuduğundan emin ol — basit tuttuk.
      </p>

      <H2>Hizmetin amacı</H2>
      <p>
        Karalama ücretsiz, kayıt gerektirmeyen bir çizim ve tahmin
        oyunudur. Arkadaşlarınla oda açıp eğlenirsin, işte o kadar.
      </p>

      <H2>Kullanıcı davranışı</H2>
      <ul className="list-disc list-inside space-y-2">
        <li>Taciz, tehdit, nefret söylemi, cinsel içerik yasaktır.</li>
        <li>Otomatik araçlarla (bot, scraper) sunucuyu yormak yasaktır.</li>
        <li>
          Başkalarının güvenliğini tehlikeye atacak kişisel bilgi paylaşımı
          yasaktır (telefon, adres, vb.).
        </li>
        <li>
          Telif haklı içerik yüklememeye ve çizimlerde başkasının marka
          veya logolarını uygunsuz biçimde kullanmamaya özen göster.
        </li>
      </ul>

      <H2>İçerik sahipliği</H2>
      <p>
        Çizdiğin çizim, yazdığın tahmin ve sohbet mesajları senin.
        Karalama bu içerikleri kaydetmez veya sahiplenmez; oyun bittiğinde
        bellekten silinir.
      </p>

      <H2>Moderasyon</H2>
      <p>
        Basit bir uygunsuz kelime filtresi var, ama tüm içerikleri
        inceleyemeyiz. Ev sahibi (oda kurucusu) oyuncuları atabilir;
        diğer oyuncular yeterince oy verirse oyuncu atılabilir. Hizmet
        kurallarını ihlal ettiğin tespit edilirse erişimin engellenebilir.
      </p>

      <H2>Sorumluluk sınırları</H2>
      <p>
        Karalama &quot;olduğu gibi&quot; sunulur. Kesintisiz veya hatasız
        çalışma garantisi vermiyoruz. Hizmeti kullanman sonucu oluşan
        doğrudan veya dolaylı zararlardan sorumlu tutulamayız.
      </p>

      <H2>Hizmetin sonlandırılması</H2>
      <p>
        İhlal durumunda veya operasyonel nedenlerle hizmeti geçici olarak
        durdurma ya da erişimini engelleme hakkımızı saklı tutarız.
      </p>

      <H2>Değişiklikler</H2>
      <p>
        Bu koşulları zaman zaman güncelleyebiliriz. Önemli değişiklikleri
        ana sayfada duyururuz; oyuna devam etmek güncel koşulları kabul
        etmek anlamına gelir.
      </p>

      <H2>Uygulanacak hukuk</H2>
      <p>Bu koşullar Türkiye Cumhuriyeti kanunlarına tabidir.</p>
    </LegalLayout>
  );
}
