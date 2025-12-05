# Environment Variables (Env) Dosyası Kurulumu

## TinyMCE API Key Kurulumu

1. **TinyMCE API Key Alın:**
   - https://www.tiny.cloud/auth/signup/ adresine gidin
   - Ücretsiz hesap oluşturun
   - API key'inizi alın

2. **.env Dosyası Oluşturun:**
   Proje kök dizininde (package.json'un olduğu yerde) `.env` dosyası oluşturun:

   ```bash
   # Windows PowerShell
   New-Item .env
   
   # Linux/Mac
   touch .env
   ```

3. **.env Dosyasına API Key Ekleyin:**
   `.env` dosyasını açın ve şu satırı ekleyin:

   ```
   VITE_TINYMCE_API_KEY=your-tinymce-api-key-here
   ```

   Örnek:
   ```
   VITE_TINYMCE_API_KEY=abc123xyz456def789
   ```

4. **Önemli Notlar:**
   - Vite kullandığımız için env değişkenleri `VITE_` prefix'i ile başlamalıdır
   - `.env` dosyası `.gitignore`'da olmalıdır (güvenlik için)
   - API key'i değiştirdikten sonra development server'ı yeniden başlatın

5. **Development Server'ı Yeniden Başlatın:**
   ```bash
   npm run dev
   ```

## Google Translate API Key Kurulumu

1. **Google Cloud Console'dan API Key Alın:**
   - https://console.cloud.google.com/ adresine gidin
   - Yeni bir proje oluşturun veya mevcut projeyi seçin
   - "APIs & Services" > "Library" bölümüne gidin
   - "Cloud Translation API" arayın ve etkinleştirin
   - "APIs & Services" > "Credentials" bölümüne gidin
   - "Create Credentials" > "API Key" seçeneğini seçin
   - API key'inizi kopyalayın

2. **.env Dosyasına API Key Ekleyin:**
   `.env` dosyanızı açın ve şu satırı ekleyin:

   ```
   VITE_GOOGLE_TRANSLATE_API_KEY=your-google-translate-api-key-here
   ```

   Örnek:
   ```
   VITE_GOOGLE_TRANSLATE_API_KEY=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

3. **API Key HTTP Referrer Kısıtlamalarını Ayarlayın (ÖNEMLİ!):**
   
   Eğer `403 Forbidden` hatası alıyorsanız, API key'inizin HTTP referrer kısıtlamalarını ayarlamanız gerekiyor:
   
   - Google Cloud Console'da API key'inizi açın (Credentials > API Keys)
   - API key'inizi seçin ve "Edit" butonuna tıklayın
   - "Application restrictions" bölümünde "HTTP referrers (web sites)" seçeneğini seçin
   - "Website restrictions" altına şu referrer'ları ekleyin:
     ```
     http://localhost:3000/*
     http://localhost:3000
     http://127.0.0.1:3000/*
     http://127.0.0.1:3000
     ```
   - Production için domain'inizi de ekleyin (örn: `https://yourdomain.com/*`)
   - "Save" butonuna tıklayın
   - ⚠️ **Not:** Değişikliklerin etkili olması birkaç dakika sürebilir

4. **Önemli Notlar:**
   - Vite kullandığımız için env değişkenleri `VITE_` prefix'i ile başlamalıdır
   - API key'i değiştirdikten sonra development server'ı yeniden başlatın
   - HTTP referrer kısıtlamaları olmadan API key kullanmak güvenlik riski oluşturur
   - Production'da mutlaka domain kısıtlamaları ekleyin

## Diğer Environment Variables

İsterseniz `.env` dosyanıza başka değişkenler de ekleyebilirsiniz:

```
VITE_TINYMCE_API_KEY=your-tinymce-api-key-here
VITE_GOOGLE_TRANSLATE_API_KEY=your-google-translate-api-key-here
VITE_APP_VERSION=1.0.0
VITE_API_BASE_URL=http://localhost:8080
```

Bu değişkenlere kod içinde şu şekilde erişebilirsiniz:

```typescript
const apiKey = import.meta.env.VITE_TINYMCE_API_KEY;
const translateApiKey = import.meta.env.VITE_GOOGLE_TRANSLATE_API_KEY;
const version = import.meta.env.VITE_APP_VERSION;
```

