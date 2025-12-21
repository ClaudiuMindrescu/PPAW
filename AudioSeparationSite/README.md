# AudioSeparationSite (demo)

Proiect ASP.NET Core MVC + MySQL pentru un site care procesează fișiere audio, cu planuri Standard / Silver / Gold și limită zilnică de joburi.

## Cum rulezi local

1. **Cerințe**
   - .NET SDK 9.x (`dotnet --version`)
   - MySQL 8+ (user cu drepturi de creare tabele)
   - Visual Studio Code (opțional)

2. **Clonează / extrage proiectul** și deschide directorul în VS Code.

3. **Setează conexiunea MySQL** în `appsettings.json`:
   ```json
   "ConnectionStrings": {
     "DefaultConnection": "server=localhost;port=3306;database=audio_site;user=root;password=your_password;"
   }
   ```

4. **Adaugă pachetele** (în directorul proiectului):
   ```bash
   dotnet add package Microsoft.EntityFrameworkCore --version 9.0.0
   dotnet add package Microsoft.EntityFrameworkCore.Design --version 9.0.0
   dotnet add package Pomelo.EntityFrameworkCore.MySql
   ```
   > Dacă apare o nepotrivire de versiuni, lasă `--version` doar la EFCore și lasă Pomelo fără versiune ca să ia varianta compatibilă.

5. **Rulează proiectul:**
   ```bash
   dotnet run
   ```
   Apoi mergi la `https://localhost:5001` sau `http://localhost:5000` (în funcție de ce ți-a pornit).

6. **Ce face seed-ul de date**
   - Creează planurile: Standard (1/zi), Silver (3/zi), Gold (5/zi)
   - Creează un user demo `demo@local` (parola "demo", doar demo)
   - Creează automat tabelele prin `EnsureCreated()`

7. **Flux de test**
   - Pagina de start arată planul și consumul pentru userul demo (id=1).
   - Încarcă un fișier audio cu formularul. Verifică limita zilnică -> salvează fișierul în `wwwroot/uploads` -> creează un job simulat.

## Notițe despre .ibd
Fișierele `.ibd` încărcate (InnoDB) nu pot fi importate direct fără metadate/DDL. Dacă vrei să folosești schema existentă:
- Dă-mi `CREATE TABLE ...` pentru fiecare tabel **sau**
- Folosește schema generată automat de EF (mai simplu pentru demo) **sau**
- Reatașează `.ibd` doar dacă baza originală a avut `innodb_file_per_table=ON` și ai aceleași versiuni MySQL + definiri (operație avansată).

## Next steps (opțional)
- Integrare autentificare reală (ASP.NET Identity)
- Procesare audio reală (queue + worker, ex. Python/ffmpeg + demucs/uvr5)
- Pagini pentru upgrade plan + plăți
- Curățare fișiere expirate, job status background


## Flux nou (Dashboard + Auth)
- Pagina implicită: **/Dashboard/Index** – prezintă funcționalitățile și planurile, cu butoane de **Login** / **Creează cont**.
- Autentificare simplă pe cookie (demo). Parolele sunt stocate SHA-256 (doar pentru demo; în producție folosește ASP.NET Identity).
- **/Home/Index** (procesare) este protejată cu [Authorize]; necesită autentificare.
- La **Register**, utilizatorul primește automat planul **Standard (1/zi)**.
