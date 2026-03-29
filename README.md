# 🫁 PulmoTrack AI: Web-Based DICOM Processing Platform

<p align="center">
  <img src="https://img.shields.io/badge/Hackathon-Project-blueviolet?style=for-the-badge" alt="Hackathon">
  <img src="https://img.shields.io/badge/Status-MVP%20Ready-success?style=for-the-badge" alt="Status">
  <img src="https://img.shields.io/badge/Tech-React%20%2B%20Vite-blue?style=for-the-badge" alt="Tech">
</p>

## 📌 Proje Hakkında
**PulmoTrack AI**, geleneksel ve hantal tıbbi görüntüleme yazılımlarına modern bir alternatif olarak geliştirilmiştir. DICOM formatındaki BT (CT) taramalarını doğrudan web tarayıcısı üzerinden işleyen, analiz eden ve görselleştiren bir ekosistemdir.

### ✨ Temel Yetenekler
- **Hızlı Görüntüleme:** Yüksek boyutlu tıbbi verilerin gecikmesiz işlenmesi.
- **Akıllı Segmentasyon:** `Morphological Closing` ve `Thresholding` algoritmaları ile otomatik akciğer ayrıştırma.
- **Yüksek Doğruluk:** %90+ başarı oranına sahip analiz modelleri.
- **Esnek Altyapı:** Farklı organlar için genişletilebilir `metadata.json` mimarisi.

---

## 🛠️ Teknoloji Yığını

| Alan | Kullanılan Teknolojiler |
| :--- | :--- |
| **Frontend** | React 19, Vite, TypeScript, Tailwind CSS |
| **Görüntü İşleme** | Python, TensorFlow, Canvas API |
| **Veri Analizi** | Recharts, Lucide React |
| **Mimari** | Component-Based Architecture |

---

## 📊 Performans Metrikleri
Proje geliştirme sürecinde elde edilen teknik veriler:

- **Model Accuracy (Doğruluk):** `%92.4`
- **Validation Loss (Kayıp):** `0.18`
- **Analiz Süresi:** `< 2 Saniye` (Her tarama için)

---

## 💻 Kurulum (Local Setup)

```bash
# Repoyu klonlayın
git clone [https://github.com/kullaniciadi/pulmotrack-ai.git](https://github.com/kullaniciadi/pulmotrack-ai.git)

# Proje dizinine gidin
cd pulmotrack-ai

# Bağımlılıkları yükleyin
npm install

# Uygulamayı başlatın
npm run dev
