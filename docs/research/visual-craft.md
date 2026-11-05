# Araştırma — Karalama Görsel Zanaat: El Yapımı / Defter Estetiğini Awwwards Seviyesine Çıkarmak  (2026-11-05)

## Soru

Karalama'nın ana sayfası ve oyun ekranları; el çizimi, defter ve kâğıt estetiğini hangi
somut, ölçülebilir tekniklerle "ödüllü site" işçiliğine taşıyabilir? Kural: yalnız
`transform` / `opacity` / `clip-path` hareketi, kaynaksız iddia yok.

> **Yığın notu (çelişki işareti).** Karalama Next 14 + Tailwind v3 + `framer-motion` 11
> + Lenis kullanıyor (`apps/web/package.json`). Ekosistemin varsayılanı Next 16 +
> Tailwind v4 + `motion/react` (`knowledge/tech-radar.md` → Çekirdek; `decisions.md`
> → Hareket). Aşağıdaki teknikler iki yığında da çalışır; framer-motion API'si
> `motion/react` ile aynı (`useScroll`, `useTransform`, `pathLength`). Göç bu raporun
> kapsamı değil, ama karar ana oturumundur.
>
> **Yerleşik kararlarla uyum.** `decisions.md` → "kaydırmaya bağlı belirme CSS ile;
> kütüphane yalnız orkestrasyon/jest/değere bağlı kaydırma". Bu rapor buna uyar:
> kaydırma efektlerinin çoğu `animation-timeline: view()` ile önerilir, framer-motion
> yalnız oyun içi orkestrasyona bırakılır. Emoji yasağı (`rules/design-tokens.md`,
> AI-Slop) oyundaki `EmojiReactions.tsx` için ayrıca değerlendirilmeli (bkz. Oyun § 12).

---

## Benzer Çözümler

| Ürün/Proje | Yaklaşım | Kaynak |
|------------|----------|--------|
| World Draw (Active Theory, Awwwards SOTD 30.04.2019) | Kullanıcı çizer, çizim 3B nesneye dönüşüp büyüyen dünyaya yerleşir; 3 renkli sınırlı palet | https://www.awwwards.com/sites/world-draw |
| Freehand Sketches ("Its just a portfolio", Awwwards Element) | El çizimleri sonsuz tuvalde, her yöne kaydırma | https://www.awwwards.com/inspiration/freehand-sketches-its-just-a-portfolio |
| Lama Lama (Awwwards Element) | Sitede gömülü tuval çizim mini oyunu, "playful/draw" etiketli | https://www.awwwards.com/inspiration/lama-lama-canvas-drawing |
| Zolplay fiyat bölümü (Awwwards Element) | Kurumsal fiyat tablosunda el çizimi vurgu | https://www.awwwards.com/inspiration/pricing-zolplay-design-studio |
| Quick, Draw! (Google Creative Lab) | 6 tur, 20 sn; sinir ağı çizerken canlı tahmin söyler | https://en.wikipedia.org/wiki/Quick,_Draw! · https://experiments.withgoogle.com/quick-draw |
| Excalidraw / Excalifont | Okunabilirliği artırılmış el yazısı font, OFL-1.1 (sayfada MIT/OFL çelişkisi var) | https://plus.excalidraw.com/excalifont |
| tldraw / perfect-freehand | Basınca duyarlı serbest çizgi; tldraw'da kalem + kutu/ok şekilleri de bununla | https://tldraw.dev/features/composable-primitives/drawing-and-canvas-interactions · https://www.github.com/steveruizok/perfect-freehand/discussions/38 |
| Rough.js / Rough Notation | El çizimi şekil (hachure dolgu, `roughness`, `bowing`) ve metin üstü animasyonlu işaretleme (~3.2 kB) | https://roughjs.com/ · https://roughnotation.com |
| FigJam | Kalem, fosforlu kalem ve **washi bant** araçları; "kişilik katmak" için doodle | https://help.figma.com/hc/en-us/sections/15329445881111 |
| Jackbox | 4 harfli oda kodu; telefon kontrolcüsü yalnız üç bileşen türü: çizim, düğme seçimi, metin | https://builtin.com/articles/jackbox-games-design-party-pack · https://www.jackboxgames.com/how-to |
| Gartic Phone | Oyunun doruğu "Albüm": tüm lobi zincirin nasıl kaydığını slayt gösterisiyle izler | https://medium.com/gartic/the-ultimate-gartic-phone-guide-all-modes-explained-805404f94948 |
| Kahoot Podium | Kullanıcılar ilk 3'ün **tek tek, aralıklı** açılmasını istiyor; toplu gösterim "blah" bulunuyor | https://support.kahoot.com/hc/en-us/community/posts/40636423376147-Podium-Celebration |
| Crowdpurr Winner Reveal | İlk 3 konfetiyle, ardından tam sıralama | https://crowdpurr.com/blog/winner-reveal-animations-effects-march-2023 |

Teknik kaynaklar her fikrin altında ayrıca verildi.

**Doğrulanamadı:** Jackbox lobi/oda kodu ekranının görsel tasarım dökümü (GDC konuşması
ya da vaka çalışması bulunamadı); Figma Config sitesinin Awwwards ödülü; tldraw.com
pazarlama sitesinin görsel kararları. Bu ürünlerden yalnız yukarıda kaynaklı olan
davranışlar alındı.

---

## Öneri — Bölüm Bölüm Somut Fikirler

Etki/efor: **E** = etki (Y/O/D), **F** = efor (Y/O/D). Öncelik sırası en altta.

### Hero

**1. İmleçle aydınlanan noktalı defter ızgarası** — E:Y F:D
- *Kaynak:* İki katmanlı nokta ızgarası; üstteki parlak katman imleç merkezli
  `radial-gradient` maskesiyle açılır, iki CSS değişkeni yazılır, kanvas/döngü yok
  (https://www.shadcn.io/background/solid/dot-pattern; yumuşatma için
  https://tympanus.net/codrops/2021/05/04/dynamic-css-masks-with-custom-properties-and-gsap/).
  Ekosistemde canlı: ahmetakyapi.com `PointerLight` (`knowledge/patterns.md` →
  "ahmetakyapi.com Sanatsal Turu").
- *Karalama:* Hero zeminine `#04070d` üstünde %6 opak indigo noktalar; ikinci katman
  marker yeşili `#c8f560` noktalar, maskeyle 220 px daire. `pointermove` → rAF'te
  `--mx/--my`; yalnız `@media (pointer: fine)`. Dokunmatikte ikinci katman yok.
- *Performans:* maskenin konumu değişir (boya), ama katman küçük ve tek; ızgara
  `background-image` sabit. Ölçülmeli; gerekirse maskeli katmanı `transform:
  translate()` ile taşınan sabit boyutlu bir daire yap (tam kurala uyar).

**2. Başlıkta el çizimi vurgu: altı çizgi / daire, yazıldıktan sonra çizilir** — E:Y F:D
- *Kaynak:* Rough Notation `underline`, `circle`, `highlight`, `bracket`;
  `annotationGroup` ile sıralı (https://roughnotation.com). Editframe çalışması: metin
  belirdikten sonra çizgi 300–400 ms'de çizilir
  (https://editframe.com/motion/studies/underline-draw-accent).
- *Karalama:* "Karalama" ya da hero başlığındaki tek kelimeye Caveat tonunda marker
  daire; SVG yolu elle bir kez çizilip sabitlenir (rastgele her yüklemede değişmesin,
  CLS ve hidrasyon farkı olmasın). Kütüphane yerine sabit SVG + `clip-path: inset(0
  100% 0 0)` → `inset(0 0 0 0)` geçişi, 380 ms, başlık girişinden 120 ms sonra.
- *Neden clip-path:* `stroke-dashoffset` boya özelliğidir; küçük SVG'de kabul edilebilir
  ama kural `clip-path` diyor. Daire gibi kapanan şekillerde soldan sağa `inset`
  yetmez → `pathLength` + dashoffset istisnasını tek bir SVG'yle sınırla, ya da
  `clip-path: circle()` ile merkezden aç.

**3. Canlı lobi önizlemesinde "tahmin balonu" ritmi (Quick, Draw! dersi)** — E:O F:O
- *Kaynak:* Quick, Draw! sinir ağı çizim sürerken tahminleri sesli/yazılı sıralar;
  oyuncu oyunun nasıl işlediğini oynarken öğrenir (https://en.wikipedia.org/wiki/Quick,_Draw!;
  https://www.designrush.com/best-designs/websites/quick-draw).
- *Karalama:* `HeroDemo.tsx` önizlemesinde çizgi kendini çizerken yandaki sohbet
  balonlarında sahte oyuncular yanlış tahminler yazar ("Kedi?", "Bulut!"), sonra doğru
  tahminde balon marker yeşiline döner + "+120" yukarı süzülür. Böylece hero, "Nasıl
  Oynanır"ı 3 saniyede gösterir. Balonlar `translateY` + `opacity`; çizgi `clip-path`.
- *Not:* Sahte tahmin metinleri gerçekçi olmalı (`decisions.md` → "örnek içerik
  gerçekçiliği", `guides/05` § 7).

### Bölümler Arası Geçişler

**4. Mürekkep silme geçişi (sprite maske yerine SVG yolu + clip-path)** — E:Y F:O
- *Kaynak:* Codrops: video karelerinden PNG sprite, CSS `mask` + `steps()` ile 70 kare
  1.4 sn (https://tympanus.net/codrops/2016/09/29/transition-effect-with-css-masks/);
  CodyHouse 25 karelik mürekkep sprite'ı (https://codyhouse.co/gem/ink-transition-effect).
- *Uyarı:* Sprite tekniği `mask-position` canlandırır → kural dışı ve ağır görsel
  (~yüzlerce kB). **Önerilen uyarlama:** Defter "Bizim Hikâyemiz" bölümünün üst kenarı
  düzensiz bir fırça kenarı olan `clip-path: polygon(...)` / `shape()` ile kesilir ve
  bölüm `animation-timeline: view()` ile alttan yukarı `clip-path` açılışıyla girer
  (`animation-range: entry 0% cover 35%`). Tek kare değil iki poligon arası
  interpolasyon: nokta sayısı eşit olmalı.
- *Teknik:* Chrome belgesi `view()` + `clip-path` + `opacity` görsel açılışı örnekler
  (https://developer.chrome.com/docs/css-ui/scroll-driven-animations); hazır demo
  (https://scroll-driven-animations.style/demos/image-reveal/css/). `@supports
  (animation-timeline: view())` içinde, `animation-timeline` kısayoldan SONRA yazılır
  (https://flaviocopes.com/css-scroll-driven-animations/).

**5. Yırtık kâğıt kenarı ayırıcı** — E:O F:D
- *Kaynak:* `clip-path: shape()` ile rastgele kıvrımlı/dişli kenar, "granularity"
  yoğunluğu (CSS-Tricks, Temani Afif, 2 Nisan 2026 — yalnız üçüncü taraf aynada
  görüldü: https://frontpage-reader-eta.vercel.app/article/cmojyiafu00b7blqc7rmh1aqg;
  orijinal css-tricks.com URL'si **doğrulanamadı**). Basit `polygon()` alternatifi MDN
  (https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_masking/Clipping).
- *Karalama:* Marquee şeridinin alt/üst kenarı ve defter bölümünün altı yırtık kenar;
  kenarın arkasında 2 px daha aşağıda, %40 opak açık ton ikinci kopya → kâğıt
  kalınlığı. `shape()` desteği tarayıcıda yoksa `polygon()` yedeği. Durağan; hareket yok.
- *Ne zaman yanlış:* Her bölüm yırtık olursa "kâğıt teması" kostüme döner; en fazla iki
  geçişte kullan.

**6. Kalemle çizilen bölüm ayırıcı (kaydırmaya bağlı)** — E:O F:D
- *Kaynak:* `useScroll({ target, offset })` + `useTransform` → değer; yatay ilerleme
  için `scaleX` (https://motion.dev/docs/react-scroll-animations). Ekosistemde canlı:
  dev imza finali `clip-path` yazma animasyonu `view()`e bağlı, aralık `entry 0% entry
  85%` (`knowledge/patterns.md`).
- *Karalama:* Bölüm başlıklarının altında elle çizilmiş dalgalı tek çizgi (SVG, sabit
  yol). `clip-path: inset(0 100% 0 0)` → `inset(0)`; CSS `view()` ile, JS yok.

### Bizim Hikâyemiz (Defter Manifestosu)

**7. Metnin kaydırmayla "yazılması" — satır satır mürekkep** — E:Y F:O
- *Kaynak:* Vara.js SVG + JSON font ile gerçek el yazısı çizimi
  (https://github.com/akzhy/Vara — 1.x SVG, v2 tuvale geçiyor, **sürümü sabitle**).
  Kelime kelime aydınlanma deseni ekosistemde katalogda seçenek
  (`decisions.md` → AI Slop tablosu: zorunlu değil, seçenek).
- *Öneri (Vara'sız):* Gerçek el yazısı stroke animasyonu Türkçe karakterler (ğ, ş, ı, İ)
  için Vara'nın JSON fontunda bulunmayabilir → **doğrulanamadı**, risk. Bunun yerine
  her defter satırı (`repeating-linear-gradient` çizgileri hizasında) Caveat ile yazılı,
  satır başına `clip-path: inset(0 100% 0 0)` → `inset(0)` `view()` timeline'ı;
  satırlar `animation-range` ile kademeli (`entry 10%`, `entry 20%`...). Etki: kalem
  soldan sağa yazıyor gibi. Ekran okuyucu metni baştan tam okur (yalnız görsel kırpma).
- *Ek:* Satırın sonunda küçük kalem ucu ikonu `translateX` ile satırla birlikte ilerler.

**8. Kenar boşluğu notları ve el çizimi oklar** — E:O F:D
- *Kaynak:* Rough.js `roughness` / `bowing` ile çizgi ve ok; SVG çıktısı verir
  (https://roughjs.com/). Daha hafif yol: elle çizilmiş 3–4 SVG ok/yıldız seti.
- *Karalama:* Defter sol kırmızı kenar çizgisinin dışında Caveat ile 1–2 not
  ("bunu ilk biz denedik" gibi) + kıvrık ok. Rough.js'i çalışma anında yükleme;
  build zamanında SVG'yi üretip sabit dosya olarak koy (rastgelelik her yüklemede
  değişmez, JS maliyeti sıfır).

### Nasıl Oynanır (Yatay Pinlenmiş 4 Adım)

**9. Adımları birbirine bağlayan, kaydırmayla çizilen kesik çizgi yolu** — E:Y F:O
- *Kaynak:* Yatay kaydırma: yapışkan kap + uzun sarmalayıcı (ör. `300vh`),
  `scrollYProgress` → `x` (https://motion.dev/docs/react-scroll-animations);
  CSS-only sürüm (https://scroll-driven-animations.style/demos/horizontal-section/css/).
  Lenis `position: sticky`'yi bozmaz: "wraps the browser's own scroll, so position:
  sticky ... keep working" (https://github.com/darkroomengineering/lenis).
- *Karalama:* 4 kartın arkasında tek uzun SVG yol (el çizimi, kesik çizgi); aynı
  `scrollYProgress` ile `clip-path: inset(0 calc(100% - var(--p)) 0 0)` açılır, her
  kart düğümüne gelince küçük yıldız `scale` 0.6→1 + `opacity` (asla `scale(0)` değil —
  slop-scan kalıbı). Kartlar hafif `rotate(-1.5deg ... 2deg)` ile masaya atılmış not gibi.
- *Uyarı:* Lenis + CSS scroll-snap uyumsuz (README "no support for CSS scroll-snap");
  pinlenmiş bölümde snap kullanma.

**10. Adım numaraları "boil" eden mürekkep (çizgi film titremesi)** — E:O F:O
- *Kaynak:* `feTurbulence` + `feDisplacementMap`; `baseFrequency` 0.02 civarı, `scale`
  ~20, ofset listesi 100 ms'de bir döngü (https://camillovisini.com/coding/simulating-hand-drawn-motion-with-svg-filters).
- *Kural uyumu için uyarlama:* Filtreyi canlı canlandırmak boya maliyeti (kural dışı).
  Bunun yerine aynı numarayı **3 farklı `seed`'li statik filtreyle** 3 katman olarak
  bas; `animation: boil 0.3s steps(1) infinite` ile yalnız `opacity` değiştirerek sırayla
  göster (çizgi filmde "line boil"). Yalnız 4 büyük rakamda, `prefers-reduced-motion`da
  tek katman.

### Özellikler (Yapışkan Not Kartları)

**11. Sticky stack: notlar üst üste yığılır, alttaki küçülür** — E:Y F:D
- *Kaynak:* CSS-only yığın demosu — yapışkanlık iç sarmalayıcıda, içerik
  canlandırılınca kaydırma alanı değişmez
  (https://scroll-driven-animations.style/demos/stacking-cards/css/); Chrome belgesindeki
  "Stacking cards" (https://developer.chrome.com/docs/css-ui/scroll-driven-animations);
  JS yedeği: CodyHouse, `transform-origin: center top`, rAF, IO ile dinleyici yalnız
  görünürken (https://codyhouse.co/tutorials/how-stacking-cards).
- *Karalama:* Her not kartı `sticky; top: calc(6rem + n*1.25rem)`; arkada kalan
  `scale: 0.94` + hafif `rotate` + karartma `opacity` katmanı. Kart renkleri: limon,
  cyan ve indigo'nun **kâğıt** tonları (doygunluk düşük), metin kontrastı AA ölçülür.
- *Tuzak (ekosistem):* Kartın `::after`ı karartmaya ayrılırsa başka efekt konmaz
  (`patterns.md` → ahmetakyapi turu, son madde).

**12. Washi bant parçaları ve kıvrık köşe** — E:O F:D
- *Kaynak:* FigJam'in washi bant aracı (https://help.figma.com/hc/en-us/sections/15329445881111);
  dişli uç için `clip-path` poligonu (MDN Clipping, yukarıda); kıvrık köşe için
  (https://kittygiraudel.com/2026/03/05/folded-corner-with-css/).
- *Karalama:* Her not kartının tepesinde `::before` bant: yarı saydam (`opacity:.55`)
  açık ton, iki ucu zikzak `polygon()`, rastgele değil kart başına sabit `--tape-rot`
  (-4°…5°). Hover'da bant sabit kalır, kart `translateY(-4px) rotate(0)` olur —
  "bantla yapışık" fiziği.

**13. "Wobbly" el çizimi çerçeve** — E:O F:D
- *Kaynak:* Asimetrik `border-radius: 255px 15px 225px 15px / 15px 225px 15px 255px`
  (https://shkspr.mobi/blog/2022/06/paper-prototype-css/; PaperCSS
  https://github.com/papercss/papercss); daha kontrollü: Dave Rupert'in SVG +
  `border-image` WobblyBox'ı (https://daverupert.com/2024/01/wobblybox/ — köşede küçük
  "tuck" artefaktı uyarısı var).
- *Karalama:* Yalnız ikincil yüzeylerde (SSS balonları, kategori çipleri, rozetler).
  Birincil CTA'ya uygulama — düğme olduğunu tanınır kılan biçim bozulmasın.

### SSS (Sohbet Biçimi)

**14. Soru balonu "yazıyor…" → cevap balonu, kaydırmaya bağlı** — E:O F:D
- *Kaynak:* Chrome belgesindeki "Contact list": aynı view timeline'a ayrı `entry` ve
  `exit` animasyonları (https://developer.chrome.com/docs/css-ui/scroll-driven-animations).
- *Karalama:* Her soru balonu `entry`'de soldan `translateX(-12px)`→0; cevap balonu
  `entry 30%`te üç noktalı "yazıyor" göstergesini `opacity` ile söndürüp yerine gelir.
  `exit`te balonlar hafif soluklaşır. Aç/kapa erişilebilirliği `<details>` ile korunur.

### Final CTA ("Hadi, Oynayalım!")

**15. CTA düğmesi etrafında kendini çizen marker dairesi + mürekkep lekesi hover'ı** — E:Y F:D
- *Kaynak:* Rough Notation `circle` (https://roughnotation.com); clip-path ile hover
  geçişi ve sekme vurgusu kaydırma, `clip-path`in yerleşime etkisi yok
  (https://emilkowal.ski/ui/the-magic-of-clip-path).
- *Karalama:* Bölüm görünür olunca düğmenin etrafında limon yeşili el çizimi daire
  `clip-path: circle()` ile açılır. Hover'da düğmenin içinde imleç noktasından
  `clip-path: circle(0 at var(--x) var(--y))` → `circle(150%)` mürekkep dolgusu
  (lekeli kenar için daire yerine sabit leke SVG'si `transform: scale` ile; `scale(0)`
  değil `scale(.05)`'ten başla).

### Footer (Dev "Karalama")

**16. Dev logotipin kaydırmayla el yazısı gibi yazılması** — E:Y F:D
- *Kaynak:* Ekosistemin ölçülmüş deseni: alt bilgi dibinde kenardan kenara SVG imza,
  `clip-path` yazma `view()`e bağlı; aralık **`entry 0% entry 85%`** — sayfanın son öğesi
  `cover N%`e hiç ulaşmaz, yarım yazılı kalır (`knowledge/patterns.md` → ahmetakyapi.com
  Sanatsal Turu). Referans dışı ek örnek: 21st.dev "Signature" (MIT, kaydırmaya bağlı
  çizim; https://21st.dev/@kevingirelli/components/signature.md).
- *Karalama:* Dev çerçeve yazılı "Karalama"nın üstüne Caveat'ta tek satır "çizdin mi?"
  eklemek yerine, logonun altına marker çizgisi; logo harfleri soldan sağa açılır.
  Bu deseni doğrudan kopyala — tuzak önceden ödenmiş.

### Küresel Doku (Tüm Ana Sayfa)

**17. Kâğıt / film greni: maske olarak, karışım modu olmadan** — E:O F:D
- *Kaynak:* SVG `feTurbulence` gürültüsü + CSS ile kontrast; `numOctaves` > 1 daha iyi
  gren (https://frontendmasters.com/blog/grainy-gradients/; CSS-Tricks Grainy Gradients
  https://css-tricks.com/?p=351302). Aynı kaynaklar SVG filtrelerinin CPU'ya pahalı
  olabildiğini not eder. Ekosistemde canlı ve ölçülmüş: `body::after` sabit katman,
  gürültü **maske** olarak, opaklık ~0.04, **mix-blend-mode yok** (bileşimci her karede
  harmanlamasın) (`knowledge/patterns.md`).
- *Karalama:* Koyu zemin için gren tonu `--grain-ink` açık lacivert; defter bölümünde
  ikinci, daha belirgin (0.07) "kâğıt lifi" katmanı yalnız o bölüme.
- *Çelişki:* CSS-Tricks tekniği `mix-blend-mode` önerir; ekosistem kararı karışım
  modunu bilerek dışarıda bırakır. Ekosistem kararı geçerli.

### Oda Kur

**18. Kaydırıcıyı "kalem darbesi" yap; kategori çiplerini çıkartma (sticker) yap** — E:O F:D
- *Kaynak:* FigJam çıkartmaları ve marker aracı (https://www.figma.com/blog/whats-new-in-figma-april-2022/;
  https://help.figma.com/hc/en-us/sections/15329445881111); wobbly çerçeve (fikir 13).
- *Karalama:* Kaydırıcı dolgusu düz çubuk değil, marker vuruşu SVG'si; değer değiştikçe
  `clip-path: inset(0 calc(100% - var(--v)) 0 0)`. Seçilen kategori çipi beyaz kenarlı
  çıkartma gibi `rotate(-2deg)` + `shadow-raised`; seçimde 120 ms "yapıştırma"
  (`scale` 1.06→1, yay). Native `<input type="range">` kalır, yalnız görünüm.

### Lobi

**19. Oda kodu "bilet" (delikli kenar + koparma çizgisi)** — E:Y F:D
- *Kaynak:* Yarım daire çentik `mask-image: radial-gradient(...)`, maske desteksiz
  tarayıcıda düz dikdörtgen yedeği (https://developer.chrome.com/docs/modern-web-guidance/guides/visual-design/shaped-cutouts);
  yan çentikli bilet (https://ishadeed.com/article/football-ticket-css-svg/). Chrome'da
  radial maske kenarında kenar yumuşatma sorunu ve `mask-composite` çözümü raporlanmış
  (https://blog.duvallj.pw/posts/2024-03-15-working-around-a-webkit-bug.html — yalnız
  arama özetiyle görüldü). Jackbox'ta katılım akışının merkezi kısa oda kodu
  (https://www.jackboxgames.com/how-to).
- *Karalama:* Bilet: solda dev mono oda kodu (harfler arası geniş, tek tek
  kopyalanabilir), ortada noktalı koparma çizgisi (yan çentikler), sağda "Bağlantıyı
  Kopyala" koçanı. Kopyalandığında koçan `rotate(6deg) translateX(8px)` ile "yırtılıp"
  geri gelir. Delikli kenar: tekrarlanan radial-gradient `mask-repeat` (kaynakta hazır
  örnek bulunamadı, kendi denemen gerekir).

**20. Oyuncu "koltukları": boş koltuk da tasarlanır** — E:Y F:O
- *Kaynak:* Jackbox: katılan oyuncunun adı ve rastgele avatarı ana ekranda belirir
  (https://builtin.com/articles/jackbox-games-design-party-pack); telefonda yalnız üç
  bileşen türü (aynı kaynak) → lobi ekranı az ama net öğe. Doğrudan Jackbox lobi
  görseli kaynağı **doğrulanamadı**; referans taraması için Game UI Database (55.500+
  ekran, ekran türü/tür filtresi;
  https://alternativeto.net/news/2024/8/game-ui-database-2-0-launches-with-over-55-500-screens-and-enhanced-tools-for-ui-designers/).
- *Karalama:* Maks oyuncu sayısı kadar sabit koltuk ızgarası; boş koltuk kesik çizgili
  el çizimi çerçeve + soluk "Bekleniyor" Caveat yazısı. Oyuncu katılınca avatar
  koltuğa `layoutId`'siz basit `y: 16 → 0` + `opacity` ile "oturur", koltuk çerçevesi
  marker rengine geçer. Bot koltuğu farklı (dişli simge + "Bot"), ev sahibi koltuğunda
  küçük taç çıkartması. Boş alan sorununu çözer: ekran hep dolu görünür, ilerleme okunur.

### Oyun

**21. Tuval: beyaz kâğıt, gerçek kâğıt gibi** — E:O F:D
- *Kaynak:* perfect-freehand basınca duyarlı çizgi; tldraw kalemi ve şekilleri bununla
  (https://tldraw.dev/features/composable-primitives/drawing-and-canvas-interactions;
  https://www.github.com/steveruizok/perfect-freehand/discussions/38).
- *Karalama:* Tuvalin üstüne (çizime değil, kabın `::after`ına) çok hafif kâğıt greni
  ve köşesinde iki bant parçası (fikir 12) → panel "masaya yapıştırılmış kâğıt" olur.
  Çizgi kalitesi için `DrawingCanvas.tsx` perfect-freehand'e geçirilebilir (ayrı karar;
  ağdan noktalar zaten gidiyorsa render tarafında düzleştirme). Kütüphane seçimi
  tech-radar dışında → onay gerektirir.
- *Uyarı:* Gren katmanı `pointer-events: none` ve tuvalin piksel verisine girmemeli
  (export/albümde gren olmasın).

**22. Doğru tahmin: puan tablosunda satır "üstüne çıkar" + marker çizgisi** — E:O F:D
- *Kaynak:* clip-path ile vurgu kaydırma tekniği (https://emilkowal.ski/ui/the-magic-of-clip-path).
- *Karalama:* `ScoreBoard.tsx`te sıra değişince satır `layout` animasyonuyla yer
  değiştirir (framer-motion orkestrasyonu — kütüphanenin meşru işi); doğru tahmin eden
  satırın arkasında limon yeşili fosforlu kalem şeridi `clip-path: inset(0 100% 0 0)`
  → `inset(0)` 300 ms, 2 sn sonra `opacity` ile söner.
- *Emoji notu:* `EmojiReactions.tsx` ekosistemin emoji yasağıyla çelişir; oyun içi tepki
  oyuncu ifadesidir, arayüz ikonu değil. Ya `slop-ok` gerekçesiyle bilinçli istisna ya da
  el çizimi SVG tepki seti. **Karar kullanıcının.**

### Tur Geçişi

**23. Sayfa çevirme / defter yaprağı geçişi** — E:Y F:O
- *Kaynak:* View Transitions: `document.startViewTransition` ekranın görüntüsünü alır;
  MDN'de `ViewTransition.ready` sonrası `::view-transition-new(root)` üzerinde imleç
  konumundan dairesel `clip-path` açılışı örneği var
  (https://developer.mozilla.org/ja/docs/Web/API/Document/startViewTransition — İngilizce
  `ViewTransition` sayfasındaki örneğin tam kodu **doğrulanamadı**, özet kesik). Gartic
  "3, 2, 1" geri sayımı tanınan bir an olarak anılıyor (yalnız hayran wiki'si, düşük
  güven: https://shapes.inc/fandom/gartic-phone).
- *Karalama:* `RoundTransition.tsx`: yeni tur kartı yırtılmış defter yaprağı (fikir 5'in
  kenarı) olarak üstten `translateY(-110%) rotate(-3deg)` → `0 rotate(1deg)` yay ile
  düşer; üstünde "3. Tur" Caveat, çizen oyuncunun adı, kelime uzunluğu kadar el çizimi
  boş çizgi. Kapanışta `clip-path: polygon` ile yırtılarak (iki poligon, sağ yarısı
  önce) gider. View Transitions desteklenmeyen tarayıcıda yalnız framer-motion
  `AnimatePresence`.

### Oyun Sonu (Kürsü)

**24. Kürsüyü tek tek, aralıklı aç; 4.–5.'yi de an** — E:Y F:D
- *Kaynak:* Kahoot topluluğu ilk 3'ün tek tek, aralıklı açılmasını istiyor; toplu 5 sn
  gösterim "blah"; 4. ve 5. de tanınmak isteniyor
  (https://support.kahoot.com/hc/en-us/community/posts/40636423376147-Podium-Celebration).
  Crowdpurr: ilk 3 konfeti, ardından tam sıralama
  (https://crowdpurr.com/blog/winner-reveal-animations-effects-march-2023).
- *Karalama:* Sıra: 3. → 2. → 1. (her biri ~1.2 sn); kürsü blokları alttan
  `clip-path: inset(100% 0 0 0)` → `inset(0)` ile "çizilerek" yükselir, 1.'nin başına el
  çizimi taç `rotate` sallanarak oturur. Konfeti yerine kâğıt kırpıntısı / kalem
  karalaması parçaları (yalnız `transform`, 24 parça tavanı, reduced-motion'da yok).
  Ardından 4.+ satırlar kürsü altında defter satırı olarak yazılır (fikir 7).

**25. Albüm: oyunun en iyi çizimlerini gösteren "galeri duvarı"** — E:Y F:O
- *Kaynak:* Gartic Phone'un doruğu albüm slayt gösterisi; ev sahibi albümün nasıl
  gösterileceğini ayarlayabiliyor
  (https://medium.com/gartic/the-ultimate-gartic-phone-guide-all-modes-explained-805404f94948;
  https://medium.com/gartic/unlocking-gartic-phone-how-to-fully-customize-your-gartic-phone-match-3c3d67f418de).
- *Karalama:* Kürsüden sonra her turun çizimi + kelimesi + ilk doğru tahmin eden, bantla
  duvara yapıştırılmış polaroid ızgarası; tıklayınca büyür. Tuval PNG'si istemcide zaten
  var (ek sunucu maliyeti doğrulanmalı). Paylaşılabilir görsel = ücretsiz büyüme.

### Profil / Rozetler

**26. Rozetler: lak/çıkartma, kazanılmamışlar kurşun kalem taslağı** — E:O F:D
- *Kaynak:* Rough.js hachure (taralı) dolgu stili (https://roughjs.com/); çıkartma dili
  FigJam (yukarıda).
- *Karalama:* Kazanılmamış rozet: aynı şekil, yalnız gri kurşun kalem konturu + hachure
  dolgu (build zamanında üretilmiş SVG). Kazanılmış: dolu renk, beyaz çıkartma kenarı,
  hover'da `rotate(-6deg) scale(1.04)`. Yeni kazanılan rozet bir kez "kalemle
  boyanır": taralı katman üstünden renkli katman `clip-path` ile çapraz açılır.

---

## Önceliklendirme (Etki / Efor)

| Sıra | Fikir | E | F | Neden önce |
|------|-------|---|---|------------|
| 1 | 19 Oda kodu bileti | Y | D | Paylaşım anı, ürünün kimliği; tek bileşen |
| 2 | 20 Oyuncu koltukları | Y | O | Lobideki boş alan sorununu doğrudan çözer |
| 3 | 24 Aralıklı kürsü | Y | D | Kaynaklı kullanıcı talebi; oyunun duygusal doruğu |
| 4 | 11 Sticky not yığını | Y | D | CSS-only demo hazır, Özellikler bölümünü taşır |
| 5 | 2 + 15 El çizimi daire/altı çizgi | Y | D | Tek SVG + clip-path; hero ve CTA'yı bağlar |
| 6 | 16 Footer logo yazılması | Y | D | Ekosistemde ölçülmüş desen, tuzağı biliniyor |
| 7 | 9 Nasıl Oynanır bağlantı yolu | Y | O | Pinlenmiş bölüme anlatı omurgası |
| 8 | 7 Defter satırlarının yazılması | Y | O | Manifesto bölümünün tek gerekçesi |
| 9 | 1 Noktalı ızgara + imleç ışığı | Y | D | Ekosistemde var; kopyala-uyarla |
| 10 | 23 Tur geçişi defter yaprağı | Y | O | Oyunun ritmini belirler |
| 11 | 25 Albüm duvarı | Y | O | Paylaşım → büyüme; ama sunucu tarafı doğrulanmalı |
| sonra | 3, 4, 5, 6, 8, 10, 12, 13, 14, 17, 18, 21, 22, 26 | O | D–O | Doku ve cila |

---

## Ne Zaman Yanlış Olur

- **Her şey el çizimi olursa** ürün çocuk etkinlik sayfasına döner ve okunabilirlik
  düşer. Kural önerisi: el yazısı (Caveat) yalnız vurgu, not ve oyun anlarında; gövde,
  form etiketleri, puan sayıları display/sans fontta kalır.
- **Rastgelelik çalışma anında üretilirse** (Rough.js, rastgele `rotate`) SSR/hidrasyon
  farkı ve CLS doğar; tüm "el yapımı" düzensizlik build zamanında ya da öğe başına sabit
  değerle üretilmeli.
- **`animation-timeline` desteği**: Chrome belgesinin rozetleri Chrome/Edge 115,
  Safari 26, Firefox 159 gösteriyor (https://developer.chrome.com/docs/css-ui/scroll-driven-animations).
  Eski tarayıcıda içerik **görünür ve durağan** olmalı (her şey `@supports` içinde,
  başlangıç durumu da). Aksi halde içerik görünmez kalır.
- **Lenis**: iframe üstünde düzgün kaydırma durur, iç içe kaydırma alanları (sohbet,
  SSS) `data-lenis-prevent` ister; `allowNestedScroll` her kaydırmada DOM taradığı için
  pahalı (https://github.com/darkroomengineering/lenis). Oyun ekranlarında Lenis'i
  hiç açmamak en güvenlisi.
- **SVG filtre (boil, gren)** büyük alanda canlı canlandırılırsa CPU'ya biner
  (https://frontendmasters.com/blog/grainy-gradients/). Yalnız statik filtre +
  `opacity` döngüsü.
- **`stroke-dashoffset` / `mask-position`** kural dışı (boya); yalnız tek, küçük SVG'de
  bilinçli istisna olarak.
- **Oyun ekranında süs** dikkat dağıtır: Jackbox'ın telefon arayüzünü üç bileşen
  türüyle sınırlaması (builtin.com kaynağı) bunun dersi. Oyun içinde efektler yalnız
  olay anlarında (doğru tahmin, tur sonu), sürekli değil.
- **Reduced motion**: kaydırmaya bağlı açılışlar ve titreşim durur, son hâl gösterilir
  (ekosistem kuralı: `MotionConfig reducedMotion="user"`, `decisions.md`).

## Öne Çıkma Fırsatı

1. **Albüm duvarı + paylaşılabilir oyun özeti görseli** (fikir 25): Gartic'in en sevilen
   anı albüm; skribbl tarzı oyunlarda bu karşılık kaynakla **doğrulanamadı**, ama
   Karalama'da tuval verisi zaten istemcide. Oyun sonu, OG görseli üreten mevcut
   `opengraph-image.tsx` altyapısıyla "bu oyunun en iyi 4 çizimi" kartına dönebilir.
2. **Hero'nun kendisi bir tur** (fikir 3): Quick, Draw!'ın "oynarken öğren" dersi;
   ziyaretçi hiçbir şey okumadan oyunun döngüsünü 3 saniyede görür.
3. **Boş koltuk tasarımı** (fikir 20): lobide bekleme süresini "dolmakta olan masa"ya
   çevirir; incelenen kaynaklarda bu konu ele alınmamış.
