# Mentor - Akıllı Prompt Sihirbazı 

Mentor, öğretmenlerin yapay zekadan (ChatGPT, Gemini, Claude vb.) en yüksek verimi alabilmesi için tasarlanmış, tarayıcı tabanlı bir akıllı prompt (yönerge) iyileştirme asistanıdır. 

Yazılan ham fikirleri pedagojik kurallara, hedef sınıf düzeyine ve branş gereksinimlerine göre analiz eder; eksik bilgileri dinamik bir sihirbaz arayüzü ile tamamlatarak kopyalanmaya hazır profesyonel promptlar üretir.

---
<img width="519" height="356" alt="image" src="https://github.com/user-attachments/assets/030a086a-368e-4d0e-808a-714dbc831b8d" />


## Öne Çıkan Özellikler

* **Doğal Dil Analizi:** Girilen metindeki ders branşını (Matematik, Türkçe, Fen Bilimleri), hedef sınıf düzeyini ve soru sayısını otomatik olarak tespit eder.
* **Etkileşimli Sihirbaz:** Prompt içinde tespit edilemeyen eksik parametreler (örneğin sınıf düzeyi veya soru sayısı) varsa, sadece gerekli alanlar için dinamik seçim pillerini devreye sokar.
* **Pedagojik Filtreleme:** Üretilen prompta branşa özel "günlük yaşamla ilişkilendirme", "cevap anahtarı kurgusu" ve "çeldirici kalitesi" gibi akademik kurallar ekler.
* **Göz Alıcı Tema Desteği:** Sağ üst köşedeki buton aracılığıyla tek tıkla Aydınlık ve Karanlık temalar arasında geçiş yapma imkanı sunar.
* **Tamamen Güvenli Yapı:** Chrome Uzantı Güvenlik Politikaları (CSP) ile tam uyumludur; satır içi (inline) JavaScript barındırmaz.

---
<img width="531" height="200" alt="image" src="https://github.com/user-attachments/assets/423dfa99-8f5c-43f1-92fc-d7fb6ced7479" />

<img width="525" height="158" alt="image" src="https://github.com/user-attachments/assets/10a8aaf1-aaab-4c40-a43f-f97a5210f41a" />

## Dosya Yapısı

Uzantı klasörünün aşağıdaki hiyerarşide yapılandırılması gerekmektedir:

```text
mentor-extension/
├── manifest.json      # Uzantı meta verileri ve izin yapılandırması
├── popup.html         # Temiz ve duyarlı kullanıcı arayüzü
├── popup.js           # NLP motoru, tema yönetimi ve etkileşim mantığı
└── README.md          # Proje dokümantasyonu
```
Nasıl Çalışır?
Mentor, girdilerinizi analiz ederken iki farklı senaryoya göre davranır:

Senaryo A: Eksik Bilgili Girdiler (Öğretici Deneyim)
Eğer arama çubuğuna yalnızca "Fen bilimleri hücre konusu sınav hazırlığı" yazarsanız:

Mentor bunun bir Fen Bilimleri dersi olduğunu anlar.

Sınıf düzeyi ve soru sayısı eksik olduğu için arayüzde dinamik olarak Sınıf Seviyesi Seçin ve Soru Sayısı Seçin alanlarını içeren sihirbazı açar.

Seçimlerinizi yaptığınız anda nihai prompt gerçek zamanlı olarak güncellenir.

Senaryo B: Tam Yapılandırılmış Girdiler
Eğer arama çubuğuna "8. sınıf LGS matematik üslü sayılar yeni nesil 10 soru" yazarsanız:

Mentor tüm parametreleri (Matematik branşı, 8. Sınıf düzeyi, 10 soru hedefi) metinden cımbızla çeker.

Herhangi bir sihirbaz açılmasına gerek kalmadan doğrudan mükemmel yapılandırılmış promptu ve Mentor analiz notunu hazırlar.

Lisans
Bu proje MIT Lisansı ile lisanslanmıştır. Eğitim süreçlerini kolaylaştırmak amacıyla özgürce geliştirilebilir ve dağıtılabilir.
