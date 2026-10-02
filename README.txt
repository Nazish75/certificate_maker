CertificateMaker — Supabase PDF Sharing
===========================================

WHAT THIS VERSION DOES
----------------------
1. Login / Sign Up with Supabase Auth.
2. Login session persists across refresh/reopen until Logout.
3. Create certificates with 8 designs.
4. Live certificate preview.
5. Save Draft saves certificate data to public.certificates.
6. Save Draft also creates a real PDF and uploads it to Supabase Storage.
7. The database stores certificate_file_url.
8. My Certificates shows the certificate preview and:
   - View Certificate
   - Open Certificate
   - Copy Share Link
   - Download PDF
   - Delete
9. The Open Certificate link is a public PDF URL that can be sent through
   WhatsApp, email, etc.

IMPORTANT SUPABASE SETUP
------------------------
1. Open Supabase Dashboard.
2. Go to SQL Editor.
3. Open/copy the included supabase.sql.
4. Run the entire SQL script.
5. Confirm there is a Storage bucket named "certificates".
6. The bucket is public so a generated PDF URL can be opened by someone
   who receives the link.
7. Email Auth should be enabled.

SECURITY
--------
- The browser contains only the Supabase publishable key.
- Never put the Supabase Secret key in script.js.
- Database RLS means users can access only their own certificate records.
- Uploaded PDFs are stored under the authenticated user's folder.

HOW TO USE
-----------
1. Start the website with VS Code Live Server.
2. Create an account or login.
3. Click Create Certificate.
4. Fill recipient, course/achievement, description, date, instructor,
   and organization.
5. Select a design.
6. Click Save Draft.
7. The certificate data is saved to the database and its PDF is uploaded
   to Storage.
8. Go to My Certificates.
9. Click Open Certificate to open the actual PDF.
10. Click Copy Share Link and send the link to another person.

DOWNLOAD PDF
------------
The Download PDF button also saves/uploads the certificate first, then
opens the stored PDF.

NOTE
----
If you already have an older certificates table, the SQL script adds the
certificate_file_url column if it is missing.
