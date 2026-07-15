// --- NLP BRANŞ SÖZLÜĞÜ ---
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

// --- GÜNEŞ VE AY SVG İKONLARI ---
const sunIcon = `
    <svg class="theme-icon" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="5"></circle>
        <line x1="12" y1="1" x2="12" y2="3"></line>
        <line x1="12" y1="21" x2="12" y2="23"></line>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
        <line x1="1" y1="12" x2="3" y2="12"></line>
        <line x1="21" y1="12" x2="23" y2="12"></line>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
    </svg>
`;

const moonIcon = `
    <svg class="theme-icon" viewBox="0 0 24 24">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
    </svg>
`;

// --- OYUN KURUCU ---
document.addEventListener('DOMContentLoaded', () => {
    initTheme();

    // Tema değiştirme tıklandığında
    document.getElementById('themeToggleBtn').addEventListener('click', toggleTheme);

    // Giriş butonları
    document.getElementById('submitBtn').addEventListener('click', processPrompt);
    document.getElementById('promptInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') processPrompt();
    });

    // Öğretici çiplerin dinlenmesi
    document.querySelectorAll('.test-chip').forEach(chip => {
        chip.addEventListener('click', (e) => {
            const targetChip = e.currentTarget;
            const text = targetChip.getAttribute('data-text');
            document.getElementById('promptInput').value = text;
            processPrompt();
        });
    });

    // Kopyalama butonu
    document.getElementById('copyBtn').addEventListener('click', copyPrompt);

    // Canlı metin güncelleme
    document.getElementById('wizTopicInput').addEventListener('input', liveUpdatePrompt);

    // Seçenek pilleri
    document.querySelectorAll('#wizGradePills .pill-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            setActivePill('wizGradePills', e.target);
            currentState.grade = e.target.getAttribute('data-val') + " seviyesine";
            liveUpdatePrompt();
        });
    });

    document.querySelectorAll('#wizCountPills .pill-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            setActivePill('wizCountPills', e.target);
            currentState.count = `Tam olarak ${e.target.getAttribute('data-val')} soru/etkinlik`;
            liveUpdatePrompt();
        });
    });
});

// --- TEMA YÖNETİMİ ---
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    const btn = document.getElementById('themeToggleBtn');
    // Eğer tema karanlıksa, butona aydınlığa geçmek için Güneş ikonu koyulur
    if (theme === 'dark') {
        btn.innerHTML = sunIcon;
    } else {
        btn.innerHTML = moonIcon;
    }
}

// --- DOĞAL DİL ANALİZİ ---
function processPrompt() {
    const userInput = document.getElementById('promptInput').value.trim();
    if (!userInput) return;

    currentState.userInput = userInput;
    const lower = userInput.toLowerCase();

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

    const gradeRegex = /(\d+)\s*(?:\.)?\s*(sınıf|sinif)/i;
    const gradeMatch = userInput.match(gradeRegex);
    if (gradeMatch) {
        currentState.grade = `${gradeMatch[1]}. Sınıf seviyesine`;
    } else if (lower.includes("lgs")) {
        currentState.grade = "8. Sınıf (LGS hazırlık) seviyesine";
    } else if (lower.includes("tyt") || lower.includes("ayt") || lower.includes("yks")) {
        currentState.grade = "Lise (YKS hazırlık) seviyesine";
    } else {
        currentState.grade = ""; 
    }

    const countRegex = /(\d+)\s*(?:adet|tane)?\s*(soru|etkinlik|madde|problem)/i;
    const countMatch = userInput.match(countRegex);
    if (countMatch) {
        currentState.count = `Tam olarak ${countMatch[1]} adet ${countMatch[2]}`;
    } else {
        currentState.count = ""; 
    }

    const simpleKeywords = ["sınav", "sınavı", "soru", "sorusu", "hazırla", "etkinlik", "test", "hazırlığı"];
    const wordsWithoutSimple = words.filter(w => !simpleKeywords.includes(w) && w !== detectedBranch);
    if (wordsWithoutSimple.length <= 1) {
        currentState.topic = ""; 
    } else {
        currentState.topic = userInput;
    }

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
        feedbackHTML = `<p>Mentor bu talebin bir ${data.title} çalışması olduğunu belirledi. Eksik detayları yukarıdaki araçlarla tamamlayabilirsiniz.</p>
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
