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

## Diğer Environment Variables

İsterseniz `.env` dosyanıza başka değişkenler de ekleyebilirsiniz:

```
VITE_TINYMCE_API_KEY=your-tinymce-api-key-here
VITE_APP_VERSION=1.0.0
VITE_API_BASE_URL=http://localhost:8080
```

Bu değişkenlere kod içinde şu şekilde erişebilirsiniz:

```typescript
const apiKey = import.meta.env.VITE_TINYMCE_API_KEY;
const version = import.meta.env.VITE_APP_VERSION;
```

