// --- NLP BRANŞ SÖZLÜĞÜ (TAMAMEN EMOJİSİZ) ---
const Taxonomy = {
    matematik: {
        title: "Matematik",
        primary: ["matematik", "geometri", "sayı", "sayılar", "denklem", "problem", "toplama", "çarpma", "kesir", "üçgen", "açılar", "cebir", "fonksiyon", "çarpanlar", "katlar", "lgs", "mat"],
        secondary: ["soru", "sınav", "çözüm", "formul", "işlem", "test"],
        role: "uzman bir Matematik Öğretmeni ve soru hazırlama komisyonu üyesi",
        feedback: "Matematik çalışması tespit edildi. Soruların bilimsel olarak hatasız, şıklarının ise doğru pedagojik çeldiricilerle kurgulanması amacıyla tüm parametreler optimize edildi."
    },
    turkce: {
        title: "Türkçe",
        primary: ["türkçe", "okuma", "metin", "paragraf", "edebiyat", "dil bilgisi", "şiir", "hikaye", "öykü", "yazım", "imla", "noktalama", "parçası", "anlama"],
        secondary: ["anlama", "özet", "soru", "kitap", "etkinlik"],
        role: "deneyimli bir Türkçe Öğretmeni ve çocuk edebiyatı uzmanı",
        feedback: "Türkçe/Edebiyat etkinliği tespit edildi. Yapay zekanın dil seviyesine ve kelime sınırlarına tam uyması amacıyla gerekli yönergeler eklendi."
    },
    fen: {
        title: "Fen Bilimleri",
        primary: ["fen", "deney", "fizik", "kimya", "biyoloji", "laboratuvar", "hücre", "element", "kuvvet", "enerji", "basınç", "güneş", "dünya", "fotosentez", "dna", "fen bilgisi"],
        secondary: ["etkinlik", "gözlem", "malzeme", "rapor", "soru", "sınav"],
        role: "alanında uzman bir Fen Bilimleri Öğretmeni ve laboratuvar koordinatörü",
        feedback: "Fen Bilimleri çalışması tespit edildi. Soruların veya deneylerin günlük yaşam pratikleriyle eşleşmesi ve bilimsel doğruluğu kontrol altına alındı."
    }
};

let currentState = {
    userInput: "",
    branch: "genel",
    grade: "",
    count: "",
    topic: "",
    format: "öğretici ve akıcı bir yapıda"
};

// --- EVENTS ---
document.addEventListener('DOMContentLoaded', () => {
    // 1. Tema Tercihini Yükle
    initTheme();

    // 2. Tema Değiştirme Butonu
    document.getElementById('themeToggleBtn').addEventListener('click', toggleTheme);

    // 3. Giriş Kontrolleri
    document.getElementById('submitBtn').addEventListener('click', processPrompt);
    document.getElementById('promptInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') processPrompt();
    });

    // 4. Öğretici Örnek Çiplerine Tıklama
    document.querySelectorAll('.test-chip').forEach(chip => {
        chip.addEventListener('click', (e) => {
            const targetChip = e.currentTarget; // Parent div'i almak için
            const text = targetChip.getAttribute('data-text');
            document.getElementById('promptInput').value = text;
            processPrompt();
        });
    });

    // 5. Kopyalama Butonu
    document.getElementById('copyBtn').addEventListener('click', copyPrompt);

    // 6. Dinamik Konu Girdisi
    document.getElementById('wizTopicInput').addEventListener('input', liveUpdatePrompt);

    // 7. Sınıf Seçim Pilleri
    document.querySelectorAll('#wizGradePills .pill-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            setActivePill('wizGradePills', e.target);
            currentState.grade = e.target.getAttribute('data-val') + " seviyesine";
            liveUpdatePrompt();
        });
    });

    // 8. Soru Sayısı Seçim Pilleri
    document.querySelectorAll('#wizCountPills .pill-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            setActivePill('wizCountPills', e.target);
            currentState.count = `Tam olarak ${e.target.getAttribute('data-val')} soru/etkinlik`;
            liveUpdatePrompt();
        });
    });
});

// --- AYDINLIK / KARANLIK TEMA YÖNETİMİ ---
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeButtonText(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeButtonText(newTheme);
}

function updateThemeButtonText(theme) {
    const btnText = document.getElementById('themeToggleText');
    if (theme === 'dark') {
        btnText.innerText = "Aydınlık Tema";
    } else {
        btnText.innerText = "Karanlık Tema";
    }
}

// --- ANA ANALİZ MOTORU ---
function processPrompt() {
    const userInput = document.getElementById('promptInput').value.trim();
    if (!userInput) return;

    currentState.userInput = userInput;
    const lower = userInput.toLowerCase();

    // 1. Branş Tespiti
    let detectedBranch = "genel";
    let maxScore = 0;
    const words = lower.split(/\s+/);
    
    for (const key in Taxonomy) {
        let score = 0;
        words.forEach((word) => {
            const cleanWord = word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"");
            if (Taxonomy[key].primary.includes(cleanWord)) score += 4;
            if (Taxonomy[key].secondary.includes(cleanWord)) score += 1;
        });
        if (score > maxScore) {
            maxScore = score;
            detectedBranch = key;
        }
    }
    if (maxScore < 2) detectedBranch = "genel";
    currentState.branch = detectedBranch;

    // 2. Sınıf Düzeyi Tespiti
    const gradeRegex = /(\d+)\s*(?:\.)?\s*(sınıf|sinif)/i;
    const gradeMatch = userInput.match(gradeRegex);
    if (gradeMatch) {
        currentState.grade = `${gradeMatch[1]}. Sınıf seviyesine`;
    } else if (lower.includes("lgs")) {
        currentState.grade = "8. Sınıf (LGS hazırlık) seviyesine";
    } else if (lower.includes("tyt") || lower.includes("ayt") || lower.includes("yks")) {
        currentState.grade = "Lise (YKS hazırlık) seviyesine";
    } else {
        currentState.grade = ""; // Boş ise sihirbaz tetiklenecek
    }

    // 3. Soru Sayısı Tespiti
    const countRegex = /(\d+)\s*(?:adet|tane)?\s*(soru|etkinlik|madde|problem)/i;
    const countMatch = userInput.match(countRegex);
    if (countMatch) {
        currentState.count = `Tam olarak ${countMatch[1]} adet ${countMatch[2]}`;
    } else {
        currentState.count = ""; // Boş ise sihirbaz tetiklenecek
    }

    // 4. Konu Tespiti
    const simpleKeywords = ["sınav", "sınavı", "soru", "sorusu", "hazırla", "etkinlik", "test", "hazırlığı"];
    const wordsWithoutSimple = words.filter(w => !simpleKeywords.includes(w) && w !== detectedBranch);
    if (wordsWithoutSimple.length <= 1) {
        currentState.topic = ""; // Boş ise sihirbaz tetiklenecek
    } else {
        currentState.topic = userInput;
    }

    // 5. Format Tespiti
    if (lower.includes("test") || lower.includes("şık") || lower.includes("seçmeli")) {
        currentState.format = "çoktan seçmeli, şıklı (A, B, C, D) test formatında";
    } else if (lower.includes("boşluk")) {
        currentState.format = "boşluk doldurma formatında";
    } else if (lower.includes("okuma metni") || lower.includes("paragraf")) {
        currentState.format = "özgün bir okuma metni ve bu metne dayalı sorular formatında";
    } else {
        currentState.format = "öğretici ve akıcı bir yapıda";
    }

    setupInteractiveWizard();
    liveUpdatePrompt();
}

// --- SİHİRBAZ GÖRÜNÜMÜNÜ DETAYA GÖRE AYARLAMA ---
function setupInteractiveWizard() {
    const wizContainer = document.getElementById('wizardContainer');
    const rowGrade = document.getElementById('rowGrade');
    const rowCount = document.getElementById('rowCount');
    const rowTopic = document.getElementById('rowTopic');

    let hasMissing = false;

    if (!currentState.grade) {
        rowGrade.style.display = 'block';
        resetActivePills('wizGradePills');
        hasMissing = true;
    } else {
        rowGrade.style.display = 'none';
    }

    if (!currentState.count) {
        rowCount.style.display = 'block';
        resetActivePills('wizCountPills');
        hasMissing = true;
    } else {
        rowCount.style.display = 'none';
    }

    if (!currentState.topic) {
        rowTopic.style.display = 'block';
        document.getElementById('wizTopicInput').value = "";
        hasMissing = true;
    } else {
        rowTopic.style.display = 'none';
    }

    wizContainer.style.display = hasMissing ? 'block' : 'none';
}

// --- GERÇEK ZAMANLI PROMPT OLUŞTURUCU ---
function liveUpdatePrompt() {
    document.getElementById('outputSection').style.display = 'block';

    const activeGrade = currentState.grade || "Belirttiğiniz sınıf düzeyine";
    const activeCount = currentState.count || "Konuya uygun miktarda soru/etkinlik";
    const inputTopicVal = document.getElementById('wizTopicInput').value.trim();
    const activeTopic = currentState.topic || (inputTopicVal ? inputTopicVal : "Genel müfredat konuları");

    let finalPrompt = "";
    let feedbackHTML = "";

    if (currentState.branch === 'genel') {
        feedbackHTML = `<p>Fikriniz analiz edildi. Eksik bir bilgi kaldıysa yukarıdaki araçlarla tamamlayabilirsiniz. Seçimleriniz promptu anında günceller.</p>`;
        finalPrompt = `Sen alanında uzman bir eğitim tasarımcısısın.
        
[Talep]: ${currentState.userInput}
[Seviye]: İçeriği ${activeGrade} uygun olarak tasarla.
[Özel Konu / Kazanım]: ${activeTopic}
[Biçim]: ${currentState.format} olacak şekilde ${activeCount} hazırlamanı istiyorum.

[Kural]: Çıktıyı öğretmenlerin doğrudan kopyalayıp derste kullanabileceği netlikte, başlıklar halinde sun.`;
    } else {
        const data = Taxonomy[currentState.branch];
        feedbackHTML = `<p>Mentor bu talebin bir <b>${data.title}</b> çalışması olduğunu belirledi. Eksik detayları yukarıdaki araçlarla tamamlayabilirsiniz.</p>
        <p style="margin-top: 8px; font-style: italic; font-size: 0.8rem;">${data.feedback}</p>`;
        finalPrompt = `Sen ${data.role} uzmanısın.

[Talep / Ana Fikir]: ${currentState.userInput}
[Özel Konu / Kazanım]: ${activeTopic}
[Hedef Seviye]: Bu çalışmayı ${activeGrade} uygun olarak tasarla.
[Etkinlik Biçimi]: İçeriği ${currentState.format} olacak şekilde ${activeCount} hazırlamanı istiyorum.

[Pedagojik Kurallar]:
1. Öğrencilerin dikkatini çekecek, güncel ve günlük hayatla ilişkili bağlamlar kullan.
2. Anlaşılır, net ve sade bir dil kullan.
3. Çalışmanın en altına öğretmenler için detaylı bir cevap anahtarı ve çözüm/açıklama rehberi ekle.`;
    }

    document.getElementById('feedbackContent').innerHTML = feedbackHTML;
    document.getElementById('improvedContent').innerText = finalPrompt;
}

// --- YARDIMCI PİLL FONKSİYONLARI ---
function setActivePill(groupId, activeBtn) {
    document.querySelectorAll(`#${groupId} .pill-btn`).forEach(btn => btn.classList.remove('active'));
    activeBtn.classList.add('active');
}

function resetActivePills(groupId) {
    document.querySelectorAll(`#${groupId} .pill-btn`).forEach(btn => btn.classList.remove('active'));
}

function copyPrompt() {
    const text = document.getElementById('improvedContent').innerText;
    navigator.clipboard.writeText(text).then(() => {
        const copyBtn = document.getElementById('copyBtn');
        copyBtn.innerText = "Kopyalandı! ✓";
        setTimeout(() => { copyBtn.innerText = "Kopyala"; }, 2000);
    });
}
