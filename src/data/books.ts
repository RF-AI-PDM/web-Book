import { Book } from '../types';

export const BOOKS_DATA: Book[] = [
  {
    id: 'competing-in-the-age-of-ai',
    title: 'Competing in The Age of AI',
    author: 'Marco Iansiti & Karim R. Lakhani',
    category: 'Future & Innovation',
    readTimeMinutes: 14,
    subtitle: 'Strategi dan Kepemimpinan Saat Algoritma dan Jaringan Menguasai Dunia',
    description: 'Bagaimana kecerdasan buatan mengubah fundamental ekonomi perusahaan tradisional menjadi sistem berbasis data yang mampu mencapai skala, cakupan, dan pembelajaran tanpa batas.',
    coverColor: '#0a1612',
    coverAccent: '#10b981',
    coverIcon: 'circuit',
    badge: 'Trending AI',
    publishedYear: 2020,
    chapters: [
      {
        id: 'ch-1',
        number: 1,
        title: 'Pengemis di Era Digital',
        readTimeMinutes: 4,
        keyQuote: 'Di era AI, batas operasional tradisional hancur. Perusahaan yang mengandalkan hierarki manusia akan tertinggal oleh pabrik digital yang belajar tanpa tidur.',
        actionItem: 'Audit proses manual berulang di organisasi Anda yang dapat digantikan oleh pipa data otomatis.',
        content: [
          'Dalam lanskap bisnis modern, pemisahan antara perusahaan teknologi dan perusahaan konvensional telah lenyap. Setiap entitas yang ingin bertahan kini beroperasi di bawah payung algoritma cerdas.',
          'Konsep "Pengemis di Era Digital" menggambarkan organisasi yang kaya akan data namun miskin arsitektur untuk memanfaatkannya. Mereka mengumpulkan tera-byte data pengguna, tetapi data tersebut terisolasi dalam silo-silo departemen tanpa kemampuan agregasi waktu nyata.',
          'Inti dari transformasi ini adalah apa yang disebut oleh Iansiti dan Lakhani sebagai "Pabrik AI" (AI Factory). Pabrik AI bukanlah bangunan fisik berisi server, melainkan arsitektur perangkat lunak yang secara konstan memproses data mentah, mengekstrak prediksi bernilai tinggi, dan mengotomatiskan keputusan operasional.',
          'Ketika sebuah organisasi menerapkan Pabrik AI, biaya marjinal untuk melayani pengguna tambahan mendekati nol. Hal ini memungkinkan perusahaan seperti Ant Group, Amazon, atau Netflix melayani ratusan juta konsumen dengan jumlah staf operasional yang jauh lebih kecil dibanding bank konvensional.'
        ]
      },
      {
        id: 'ch-2',
        number: 2,
        title: 'Mesin Berbasis AI & Skala Tanpa Batas',
        readTimeMinutes: 4,
        keyQuote: 'Skala tradisional dibatasi oleh kejenuhan manajerial. Skala berbasis algoritma diperkuat oleh hukum jaringan data.',
        actionItem: 'Petakan lingkaran umpan balik (feedback loop) data pelanggan ke dalam siklus iterasi produk.',
        content: [
          'Pada masa kejayaan industri abad ke-20, pertumbuhan perusahaan selalu berbenturan dengan kurva diminishing returns (hasil yang semakin berkurang). Semakin besar pabrik, semakin rumit birokrasi koordinasi.',
          'Namun, sistem digital berbasis kecerdasan buatan membalikkan hukum fisika korporat ini. Algoritma pembelajaran mesin (machine learning) menjadi semakin pintar seiring bertambahnya volume interaksi pengguna.',
          'Setiap kali pengguna melakukan pencarian, mendengarkan lagu, atau membeli barang, model menerima sinyal umpan balik (feedback loop). Sinyal ini secara instan melatih kembali model untuk memberikan rekomendasi yang lebih tajam bagi seluruh pengguna berikutnya.',
          'Hasilnya adalah terciptanya efek jaringan data (data network effects), di mana keunggulan kompetitif yang diraih pemimpin pasar menjadi parit pertahanan (moat) yang hampir mustahil dikejar oleh pesaing tradisional.'
        ]
      },
      {
        id: 'ch-3',
        number: 3,
        title: 'Pelepasan Skala dan Lingkup (Scope & Scale)',
        readTimeMinutes: 3,
        keyQuote: 'Cakupan bisnis tidak lagi ditentukan oleh lini perakitan, melainkan fleksibilitas repositori data.',
        actionItem: 'Eksplorasi layanan pelengkap yang dapat ditawarkan ke pelanggan saat ini tanpa menambah beban inventaris fisik.',
        content: [
          'Perusahaan konvensional memerlukan investasi modal besar setiap kali ingin berekspansi ke industri baru. Sebaliknya, perusahaan digital mampu memperluas "lingkup" (scope) bisnis mereka dengan biaya marjinal yang sangat rendah.',
          'Contoh nyata adalah evolusi aplikasi super di Asia. Platform yang awalnya berakar pada pemesanan transportasi dapat dengan cepat merambah ke pembayaran dompet digital, pengiriman makanan, hingga asuransi mikro.',
          'Kemampuan ini lahir karena fondasi perangkat lunak dan graf data pengguna dapat digunakan kembali lintas produk. Kepercayaan dan profil pengguna yang telah terverifikasi menjadi aset cair yang siap disalurkan ke domain bisnis baru.'
        ]
      },
      {
        id: 'ch-4',
        number: 4,
        title: 'Etika, Algoritma, dan Masa Depan Kepemimpinan',
        readTimeMinutes: 3,
        keyQuote: 'Pemimpin modern tidak lagi sekadar mengarahkan orang; mereka mengaudit algoritma dan menjaga kompas moral mesin.',
        actionItem: 'Bentuk komite etika kecerdasan buatan untuk mengawasi bias dan privasi data pelanggan.',
        content: [
          'Kekuatan eksponensial Pabrik AI membawa risiko sistemik yang belum pernah dihadapi peradaban manusia sebelumnya: bias algoritma, privasi data yang terancam, dan ketergantungan kritis pada model kotak hitam (black-box).',
          'Kepemimpinan di era kecerdasan buatan menuntut pemahaman teknologis yang mendalam dipadukan dengan tanggung jawab etis. Algoritma yang dioptimalkan murni untuk engagement sering kali memicu polarisasi atau diskriminasi terselubung.',
          'Tugas terbesar eksekutif masa depan bukanlah menulis kode, melainkan menetapkan parameter nilai, memastikan transparansi keputusan mesin, dan menanamkan kepedulian manusia ke dalam arsitektur digital.'
        ]
      }
    ]
  },
  {
    id: '48-laws-of-power',
    title: 'The 48 Laws of Power',
    author: 'Robert Greene',
    category: 'Business & Leadership',
    readTimeMinutes: 13,
    subtitle: 'Permainan yang Tidak Bisa Anda Hindari dalam Dinamika Kekuasaan',
    description: 'Panduan amoral dan tajam mengenai dinamika kekuasaan, strategi pengaruh, dan navigasi politik organisasi berdasarkan sejarah ribuan tahun para raja, filsuf, dan penipu ulung.',
    coverColor: '#1e1022',
    coverAccent: '#f59e0b',
    coverIcon: 'crown',
    badge: 'Buku Hari Ini',
    publishedYear: 1998,
    chapters: [
      {
        id: 'law-intro',
        number: 1,
        title: 'Permainan yang Tidak Bisa Anda Hindari',
        readTimeMinutes: 3,
        keyQuote: 'Kekuasaan seperti permainan catur; berpura-pura tidak ingin bermain hanya membuat Anda menjadi bidak yang mudah dikorbankan.',
        actionItem: 'Kenali motif tersembunyi di balik tindakan orang-orang di lingkaran profesional Anda tanpa bersikap sinis.',
        content: [
          'Banyak orang mengklaim bahwa mereka tidak tertarik pada kekuasaan atau politik kantor. Robert Greene menegaskan bahwa sikap tersebut adalah ilusi naif atau kepura-puraan yang berbahaya.',
          'Kekuasaan adalah hukum gravitasi sosial. Di mana pun ada dua manusia atau lebih berkumpul, dinamika pengaruh, hierarki, dan persaingan bawah sadar akan selalu bekerja.',
          'Memahami hukum kekuasaan bukan berarti Anda harus menjadi manipulatif atau jahat. Mempelajarinya adalah bentuk pertahanan diri terbaik agar Anda tidak menjadi mangsa bagi mereka yang menguasai seni manuver ini.'
        ]
      },
      {
        id: 'law-1',
        number: 2,
        title: 'Hukum 1: Jangan Pernah Mengungguli Tuan Anda',
        readTimeMinutes: 3,
        keyQuote: 'Selalu buat orang yang berada di atas Anda merasa lebih cerdas dan superior secara elegan.',
        actionItem: 'Berikan kredit atas keberhasilan proyek kepada atasan Anda untuk membangun rasa aman mereka.',
        content: [
          'Kesalahan paling umum dari para profesional muda yang ambisius adalah memamerkan kecerdasan atau bakat mereka secara berlebihan di depan atasan.',
          'Tindakan ini tanpa sadar memicu rasa tidak aman (insecurity) pada diri pemimpin. Ingatlah tragedi Nicolas Fouquet, menteri keuangan Prancis yang menyelenggarakan pesta termewah untuk Raja Louis XIV dengan niat memukau sang raja, namun justru berakhir dipenjara seumur hidup karena raja merasa tersaingi.',
          'Sebaliknya, seniman dan ilmuwan Galileo Galilei mengabadikan penemuannya dengan menamai bulan-bulan Jupiter menggunakan nama keluarga penguasa Medici, memastikan dirinya mendapatkan patronase seumur hidup.'
        ]
      },
      {
        id: 'law-3',
        number: 3,
        title: 'Hukum 3: Samarkan Niat Anda',
        readTimeMinutes: 4,
        keyQuote: 'Orang yang transparan dalam segala hal mudah ditebak, dimanipulasi, dan diserang.',
        actionItem: 'Praktikkan jeda berpikir dan jangan membeberkan strategi jangka panjang sebelum fondasinya kokoh.',
        content: [
          'Dalam era media sosial di mana semua orang didorong untuk "otentik" dan terbuka, kemampuan untuk menyamarkan tujuan strategis menjadi aset langka yang bernilai tinggi.',
          'Gunakan umpan palsu (red herring) dan sinyal yang membingungkan lawan bicara jika Anda sedang mempersiapkan langkah penting dalam negosiasi atau kompetisi bisnis.',
          'Biarkan tindakan Anda berbicara saat hasil akhir telah tercapai, bukan pada tahap perancangan di mana lawan masih memiliki peluang untuk menggagalkannya.'
        ]
      },
      {
        id: 'law-15',
        number: 4,
        title: 'Hukum 15: Hadapi Rintangan Secara Tuntas',
        readTimeMinutes: 3,
        keyQuote: 'Bara api yang tersisa dalam abu suatu saat akan menyulut kebakaran baru.',
        actionItem: 'Selesaikan konflik mendasar hingga ke akarnya, jangan biarkan dendam tersembunyi merusak kerja sama tim.',
        content: [
          'Ketika Anda harus menghadapi krisis atau lawan yang memiliki niat merusak, setengah langkah adalah pilihan paling berisiko.',
          'Sejarah menunjukkan bahwa para jenderal yang menunjukkan belas kasihan palsu kepada musuh yang belum sepenuhnya menerima kekalahan justru akan menghadapi pemberontakan berulang di kemudian hari.',
          'Dalam dunia manajemen, ini berarti mengambil keputusan tegas dalam restrukturisasi atau penegakan integritas tanpa membiarkan masalah laten menggerogoti kultur tim.'
        ]
      }
    ]
  },
  {
    id: 'prediction-machines',
    title: 'Prediction Machines',
    author: 'Ajay Agrawal, Joshua Gans & Avi Goldfarb',
    category: 'Future & Innovation',
    readTimeMinutes: 15,
    subtitle: 'Ekonomi Sederhana dari Kecerdasan Buatan',
    description: 'Buku wajib para ekonom Universitas Toronto yang membongkar AI menjadi prinsip ekonomi dasar: ketika biaya prediksi jatuh mendekati nol, nilai penilaian manusia melonjak drastis.',
    coverColor: '#1c151b',
    coverAccent: '#ef4444',
    coverIcon: 'trending-up',
    badge: 'Ekonomi AI',
    publishedYear: 2018,
    chapters: [
      {
        id: 'pm-1',
        number: 1,
        title: 'Momen AI Anda & Penurunan Biaya Prediksi',
        readTimeMinutes: 5,
        keyQuote: 'AI tidak menghasilkan sihir; AI hanya membuat satu hal menjadi luar biasa murah: prediksi data.',
        actionItem: 'Identifikasi bagian mana dari bisnis Anda yang menghabiskan biaya terbesar untuk menebak preferensi pasar.',
        content: [
          'Ketika lampu listrik pertama kali ditemukan, para ekonom tidak melihatnya sebagai revolusi misterius, melainkan sekadar penurunan drastis biaya penerangan.',
          'Begitu pula dengan kecerdasan buatan modern. Kemajuan deep learning pada hakikatnya adalah penurunan biaya prediksi dari ribuan dolar menjadi sepersekian sen.',
          'Ketika harga suatu komoditas turun drastis, dunia tidak hanya menggunakannya lebih banyak, tetapi juga mulai menggunakannya untuk memecahkan masalah yang sebelumnya tidak dianggap sebagai masalah prediksi.'
        ]
      },
      {
        id: 'pm-2',
        number: 2,
        title: 'Nilai Komplementer: Penilaian Manusia (Judgment)',
        readTimeMinutes: 5,
        keyQuote: 'Saat mesin mengambil alih ramalan masa depan, manusia memegang kendali atas apa yang sebenarnya kita inginkan.',
        actionItem: 'Latih kemampuan empati dan etika kepemimpinan tim Anda sebagai kompetensi komplementer bagi AI.',
        content: [
          'Hukum ekonomi menyatakan: ketika harga barang komoditas turun, nilai barang komplementernya akan melonjak.',
          'Dalam konteks AI, komoditasnya adalah prediksi mesin, sedangkan komplemennya adalah pertimbangan nilai manusia (human judgment). Mesin dapat memprediksi peluang seorang pasien sembuh dengan obat tertentu, namun hanya manusia yang dapat memutuskan apakah efek sampingnya layak ditanggung secara moral.',
          'Oleh karena itu, masa depan pekerjaan bukanlah tentang menyaingi kalkulasi AI, melainkan memperkuat kebijaksanaan, negosiasi, dan etika.'
        ]
      },
      {
        id: 'pm-3',
        number: 3,
        title: 'Pergeseran Model Bisnis dari Belanja-ke-Kirim',
        readTimeMinutes: 5,
        keyQuote: 'Ketika akurasi prediksi melampaui ambang kritis, seluruh rantai pasok berputar 180 derajat.',
        actionItem: 'Pertimbangkan bagaimana akurasi data dapat memotong waktu tunggu pelanggan Anda secara drastis.',
        content: [
          'Amazon saat ini beroperasi dengan model belanja-lalu-kirim (shop-then-ship). Anda memilih barang, membayar, lalu mereka mengirimkannya.',
          'Namun dengan peningkatan model prediksi belanja, Amazon dapat beralih ke model kirim-lalu-belanja (ship-then-shop): barang tiba di depan pintu Anda sebelum Anda memesannya, dan Anda hanya perlu mengembalikan barang yang tidak diinginkan.',
          'Perubahan ini menggambarkan bagaimana penurunan biaya prediksi merombak model bisnis industri logistik global.'
        ]
      }
    ]
  },
  {
    id: 'a-world-without-work',
    title: 'A World Without Work',
    author: 'Daniel Susskind',
    category: 'Future & Innovation',
    readTimeMinutes: 13,
    subtitle: 'Teknologi, Otomasi, dan Bagaimana Kita Harus Menanggapinya',
    description: 'Analisis mendalam dari ekonom Oxford tentang bagaimana kecerdasan mesin akan secara bertahap memotong kebutuhan akan tenaga kerja manusia dan cara kita mendefinisikan kemakmuran.',
    coverColor: '#0f172a',
    coverAccent: '#38bdf8',
    coverIcon: 'cpu',
    publishedYear: 2020,
    chapters: [
      {
        id: 'www-1',
        number: 1,
        title: 'Saat Mesin Mengambil Alih Pekerjaan Manusia',
        readTimeMinutes: 4,
        keyQuote: 'Mesin tidak perlu meniru cara kerja otak manusia untuk melampaui kemampuan profesional manusia.',
        actionItem: 'Jangan merasa aman hanya karena profesi Anda membutuhkan gelar sarjana; kembangkan keahlian multidisiplin.',
        content: [
          'Selama berabad-abad, kita percaya pada "Kekeliruan Terminator" (Terminator Fallacy): anggapan bahwa mesin hanya bisa menggantikan tugas manusia jika mesin itu bisa berpikir dan bernalar seperti manusia.',
          'Daniel Susskind membuktikan bahwa paradigma ini salah. Deep learning tidak membutuhkan kesadaran untuk mendiagnosis kanker lebih akurat daripada dokter spesialis radiologi, atau merancang kontrak hukum lebih cepat dari firma ternama.',
          'Pekerjaan kerah putih kini berada di garis depan gelombang otomasi generasi berikutnya.'
        ]
      },
      {
        id: 'www-2',
        number: 2,
        title: 'Dilema Distribusi dan Masa Depan Makna',
        readTimeMinutes: 5,
        keyQuote: 'Tantangan abad ke-21 bukan lagi kelangkaan produksi, melainkan keadilan distribusi.',
        actionItem: 'Mulai bangun identitas diri di luar sekadar jabatan pekerjaan atau profesi harian Anda.',
        content: [
          'Di masa lalu, pekerjaan memiliki dua fungsi utama: memproduksi barang bernilai dan mendistribusikan pendapatan kepada masyarakat melalui upah.',
          'Jika mesin memproduksi sebagian besar kekayaan tanpa melibatkan banyak tenaga kerja, mekanisme distribusi upah akan runtuh. Kita membutuhkan reformasi perpajakan modal dan konsep jaring pengaman universal.',
          'Lebih dari sekadar uang, manusia memerlukan rasa tujuan dan makna yang selama ini didapat dari karier. Kita harus belajar mengisi waktu luang dengan aktivitas kultural dan intelektual yang bermakna.'
        ]
      },
      {
        id: 'www-3',
        number: 3,
        title: 'Menata Ulang Pendidikan untuk Era Algoritma',
        readTimeMinutes: 4,
        keyQuote: 'Sistem pendidikan yang melatih anak-anak menjadi komputer berjalan adalah resep menuju pengangguran.',
        actionItem: 'Fokuskan pembelajaran pada pemikiran kritis, adaptabilitas emosional, dan kolaborasi tim.',
        content: [
          'Kurikulum sekolah yang berfokus pada hafalan rumus dan prosedur baku sedang melatih generasi muda untuk bersaing di bidang yang paling dikuasai oleh algoritma.',
          'Pendidikan masa depan harus bergeser ke arah pemikiran filosofis, komunikasi persuasif, serta pemahaman atas interaksi sosial yang kompleks.',
          'Kemampuan untuk terus belajar kembali (unlearning and relearning) akan menjadi keterampilan hidup paling krusial.'
        ]
      }
    ]
  },
  {
    id: 'the-book-of-wisdom',
    title: 'The Book of Wisdom (Al-Hikam)',
    author: 'Ibn Ata\'illah as-Sakandari',
    category: 'Mindfulness & Wisdom',
    readTimeMinutes: 12,
    subtitle: 'Aforisme Abadi untuk Menenangkan Jiwa yang Gelisah',
    description: 'Untaian mutiara kearifan sufistik klasik yang membahas kepasrahan batin, pelepasan ambisi yang melelahkan, dan ketenangan hakiki di tengah ketidakpastian duniawi.',
    coverColor: '#161922',
    coverAccent: '#38bdf8',
    coverIcon: 'sparkles',
    publishedYear: 1300,
    chapters: [
      {
        id: 'hikam-1',
        number: 1,
        title: 'Kalimat-Kalimat Pendek untuk Hati yang Lelah',
        readTimeMinutes: 4,
        keyQuote: 'Keinginanmu untuk bebas dari beban materi saat Tuhan menempatkanmu di sana adalah syahwat yang tersembunyi.',
        actionItem: 'Sadari bahwa kedamaian bukan berarti lari dari kenyataan, melainkan penerimaan utuh atas momen saat ini.',
        content: [
          'Kitab Al-Hikam diawali dengan pengingat mendalam tentang bahaya ketergantungan pada amalan atau usaha pribadi hingga membuat hati sombong saat berhasil dan putus asa saat gagal.',
          'Tanda keterikatan yang keliru pada hasil adalah menurunnya harapan batin ketika seseorang melakukan kesalahan atau menghadapi kegagalan tak terduga.',
          'Ketenteraman sejati dicapai ketika seseorang berikhtiar secara maksimal secara fisik, namun hatinya sepenuhnya bersandar pada kebijaksanaan Yang Maha Kuasa.'
        ]
      },
      {
        id: 'hikam-2',
        number: 2,
        title: 'Menyerahkan Kendali & Menemukan Keheningan',
        readTimeMinutes: 4,
        keyQuote: 'Istirahatkan dirimu dari mengatur apa yang telah diatur untukmu oleh Sang Pencipta.',
        actionItem: 'Lepaskan kecemasan berlebih atas masa depan yang belum terjadi selama 15 menit melalui meditasi hening.',
        content: [
          'Manusia modern kerap menderita bukan karena beban pekerjaan fisik, melainkan kelelahan mental akibat keinginan mengontrol segala variabel kehidupan.',
          'Ibn Ata\'illah menasihatkan agar kita "mengistirahatkan akal dari tadbir" (obsesi mengatur takdir). Menjalankan tanggung jawab hari ini dengan khidmat jauh lebih sehat daripada mencemaskan esok hari.',
          'Ketika kita melepaskan ilusi kendali total, energi batin kita kembali terisi untuk mengasihi sesama dan berkarya dengan ikhlas.'
        ]
      },
      {
        id: 'hikam-3',
        number: 3,
        title: 'Cahaya Kesadaran dan Ketulusan Niat',
        readTimeMinutes: 4,
        keyQuote: 'Amal perbuatan adalah jasad yang tegak, dan ruhnya adalah rahasia keikhlasan di dalamnya.',
        actionItem: 'Periksa kembali niat terdalam Anda di balik pencapaian karier atau karya yang sedang Anda bangun.',
        content: [
          'Pencapaian besar yang tampak memukau di mata publik bisa jadi kosong tanpa makna jika didorong semata-mata oleh ego dan kehausan akan pujian.',
          'Keikhlasan adalah kekuatan transformatif yang mengubah rutinitas biasa menjadi sumber berkah dan ketenangan batin.',
          'Hiduplah dengan kesadaran bahwa nilai sejati Anda tidak ditentukan oleh metrik eksternal, melainkan kemurnian hati nurani Anda.'
        ]
      }
    ]
  },
  {
    id: 'the-archetypes-and-collective-unconscious',
    title: 'The Archetypes and The Collective Unconscious',
    author: 'Carl Gustav Jung',
    category: 'Mind & Behavior',
    readTimeMinutes: 15,
    subtitle: 'Menjelajahi Lapisan Terdalam Psike Manusia',
    description: 'Karya agung psikologi analitis yang mengungkap arketipe universal, alam bawah sadar kolektif, simbol mimpi, dan integrasi bayang-bayang batin menuju individuasi.',
    coverColor: '#17161c',
    coverAccent: '#e2e8f0',
    coverIcon: 'brain',
    publishedYear: 1959,
    chapters: [
      {
        id: 'jung-1',
        number: 1,
        title: 'Mimpi Pasien yang Tidak Pernah Membaca Mitologi',
        readTimeMinutes: 5,
        keyQuote: 'Alam bawah sadar kita bukanlah tempat sampah ingatan masa lalu, melainkan samudra kebijaksanaan leluhur.',
        actionItem: 'Catat mimpi yang berulang atau motif simbolik yang sering muncul dalam imajinasi Anda.',
        content: [
          'Carl Jung menemukan bahwa pasien-pasiennya yang berasal dari latar belakang sederhana sering kali memimpikan simbol mitologis kuno dari peradaban Mesir atau India yang belum pernah mereka pelajari.',
          'Penemuan ini membawanya pada konsep "Alam Bawah Sadar Kolektif" (Collective Unconscious): lapisan psike terdalam yang diwariskan secara biologis dan kultural oleh seluruh spesies manusia.',
          'Di dalam lapisan ini bersemayam cetak biru psikologis universal yang disebut Arketipe (The Archetypes).'
        ]
      },
      {
        id: 'jung-2',
        number: 2,
        title: 'Bayang-Bayang (Shadow) dan Topeng Sosial (Persona)',
        readTimeMinutes: 5,
        keyQuote: 'Seseorang tidak menjadi tercerahkan dengan membayangkan sosok cahaya, melainkan dengan membuat kegelapan menjadi sadar.',
        actionItem: 'Identifikasi sifat orang lain yang paling membuat Anda kesal; sering kali itu adalah cerminan bayang-bayang Anda sendiri.',
        content: [
          'Persona adalah topeng yang kita kenakan untuk diterima oleh masyarakat dan norma sosial. Namun semakin kita menekan bagian diri yang tidak disukai, semakin kuat "Bayang-bayang" (The Shadow) kita tumbuh di kegelapan batin.',
          'Menolak bayang-bayang menyebabkan proyeksi psikologis: kita menuduh orang lain memiliki kelemahan yang sebenarnya berakar dalam diri kita sendiri.',
          'Penyembuhan sejati dimulai ketika kita memiliki keberanian untuk merangkul dan mengintegrasikan bayang-bayang tersebut ke dalam kesadaran.'
        ]
      },
      {
        id: 'jung-3',
        number: 3,
        title: 'Proses Individuasi Menuju Keutuhan Diri',
        readTimeMinutes: 5,
        keyQuote: 'Tujuan hidup bukanlah kesempurnaan tanpa cela, melainkan keutuhan diri yang harmonis.',
        actionItem: 'Seimbangkan antara tuntutan logika rasional dengan intuisi batin dalam pengambilan keputusan besar.',
        content: [
          'Individuasi adalah perjalanan seumur hidup untuk menyatukan berbagai aspek psike yang terpecah—Persona, Shadow, Anima/Animus—menuju pusat kesadaran yang disebut Diri (The Self).',
          'Proses ini sering kali ditandai oleh krisis paruh baya di mana ambisi eksternal kehilangan daya tariknya dan panggilan batin untuk mencari makna hidup menjadi tak terbendung.',
          'Mereka yang berhasil melewati individuasi memancarkan kedewasaan emosional yang tenang dan tidak mudah diguncang oleh opini khalayak ramai.'
        ]
      }
    ]
  },
  {
    id: 'the-bomber-mafia',
    title: 'The Bomber Mafia',
    author: 'Malcolm Gladwell',
    category: 'World & Culture',
    readTimeMinutes: 14,
    subtitle: 'Obsesi, Inovasi, dan Dilema Moral di Langit Perang Dunia II',
    description: 'Kisah menegangkan tentang sekelompok penerbang visioner yang percaya teknologi bom presisi Norden dapat mengakhiri kebrutalan perang, dan benturan kerasnya dengan realitas medan tempur.',
    coverColor: '#0f172a',
    coverAccent: '#38bdf8',
    coverIcon: 'compass',
    publishedYear: 2021,
    chapters: [
      {
        id: 'bm-1',
        number: 1,
        title: 'Malam Terpanjang & Mimpi Bom Presisi',
        readTimeMinutes: 4,
        keyQuote: 'Inovator sejati sering kali dibutakan oleh keindahan ide mereka sendiri hingga melupakan kekacauan cuaca dan realitas manusia.',
        actionItem: 'Uji hipotesis produk Anda di lingkungan paling keras sebelum mengklaim solusi Anda sempurna.',
        content: [
          'Di Maxwell Field, Alabama pada tahun 1930-an, sekelompok perwira udara muda membentuk lingkaran perbincangan revolusioner yang kelak dijuluki "Bomber Mafia".',
          'Mereka muak dengan pembantaian parit Perang Dunia I. Visi mereka radikal: dengan bom presisi tinggi menggunakan alat bidik Norden, perang tidak perlu lagi membakar seluruh kota.',
          'Pesawat pengebom dapat melumpuhkan simpul kritis musuh—seperti pabrik bantalan peluru atau kilang minyak—dengan bedah bedil layaknya pisau dokter bedah.'
        ]
      },
      {
        id: 'bm-2',
        number: 2,
        title: 'Curtis LeMay vs Haywood Hansell: Benturan Filsafat',
        readTimeMinutes: 5,
        keyQuote: 'Di saat krisis melanda, para idealis sering kali disingkirkan oleh para pragmatis yang hanya peduli pada kemenangan cepat.',
        actionItem: 'Kenali kapan proyek Anda membutuhkan ketegasan eksekusi dan kapan membutuhkan komitmen pada prinsip etis.',
        content: [
          'Konflik utama buku ini bermuara pada dua jenderal: Haywood Hansell sang idealis penganut bom presisi, melawan Curtis LeMay sang jenderal pragmatis tanpa ampun.',
          'Ketika awan tebal dan angin jet stream di atas Tokyo membuat bidikan Norden tidak berguna, Hansell menolak membakar area pemukiman warga sipil dan akhirnya dicopot dari jabatannya.',
          'LeMay mengambil alih, mengganti bom berdaya ledak tinggi dengan bom napalm cair, dan meluncurkan serangan badai api yang meluluhlantakkan Tokyo dalam semalam untuk memaksa kapitulasi cepat.'
        ]
      },
      {
        id: 'bm-3',
        number: 3,
        title: 'Warisan Teknologi dan Kemenangan Jangka Panjang',
        readTimeMinutes: 5,
        keyQuote: 'Hansell kalah dalam pertempuran di Tokyo, namun visinya tentang bom presisi akhirnya memenangkan masa depan.',
        actionItem: 'Jangan berkecil hati jika inovasi Anda dinilai terlalu dini untuk zamannya; waktu sering kali membuktikan kebenarannya.',
        content: [
          'Meskipun LeMay memenangkan perang di masa itu, perkembangan militer modern abad ke-21 membuktikan kemenangan jangka panjang bagi Bomber Mafia.',
          'Kini, rudal berpemandu GPS dan drone presisi telah menggantikan pengeboman karpet massal yang barbar.',
          'Gladwell mengajak kita merenungkan bahwa terkadang kegagalan heroik seorang visioner adalah batu loncatan yang esensial bagi kemanusiaan.'
        ]
      }
    ]
  },
  {
    id: 'the-new-ceo',
    title: 'The New CEO',
    author: 'Ty Wiggins',
    category: 'Business & Leadership',
    readTimeMinutes: 12,
    subtitle: 'Dua Belas Bulan Pertama yang Menentukan Sisa Masa Jabatan Anda',
    description: 'Penelitian berbasis data tentang transisi kepemimpinan eksekutif tertinggi: bagaimana 100 hari pertama menentukan keberhasilan atau kegagalan kepemimpinan seorang CEO modern.',
    coverColor: '#111827',
    coverAccent: '#60a5fa',
    coverIcon: 'shield',
    publishedYear: 2023,
    chapters: [
      {
        id: 'ceo-1',
        number: 1,
        title: 'Dua Belas Bulan Pertama yang Menentukan',
        readTimeMinutes: 4,
        keyQuote: 'CEO tidak dinilai dari apa yang mereka rencanakan, melainkan seberapa cepat mereka membangun momentum kepercayaan.',
        actionItem: 'Buat rencana pendengaran terstruktur (listening tour) untuk 30 hari pertama di peran baru Anda.',
        content: [
          'Transisi kepemimpinan adalah fase paling rapuh dalam siklus hidup korporat. Lebih dari 40% CEO baru gagal memenuhi ekspektasi dalam 18 bulan pertama mereka.',
          'Ty Wiggins menekankan bahwa jebakan terbesar adalah bertindak terlalu cepat tanpa mendengarkan, atau sebaliknya, terlalu lambat mengambil keputusan sulit terkait personalia kunci.',
          'Kunci keberhasilan terletak pada kemampuan menyeimbangkan quick wins (kemenangan cepat) yang membangun moral dengan roadmap transformasi jangka panjang.'
        ]
      },
      {
        id: 'ceo-2',
        number: 2,
        title: 'Menilai Tim Warisan dan Membangun Koalisi',
        readTimeMinutes: 4,
        keyQuote: 'Orang yang membawa perusahaan ke posisinya saat ini belum tentu orang yang tepat untuk membawanya ke level berikutnya.',
        actionItem: 'Lakukan evaluasi obyektif terhadap keselarasan nilai dan kompetensi jajaran direksi Anda.',
        content: [
          'Sebagai pemimpin baru, Anda mewarisi tim dengan dinamika politik dan loyalitas masa lalu yang rumit.',
          'Wiggins menyarankan kerangka kerja evaluasi matriks: membedakan antara mereka yang memiliki kompetensi tinggi namun resisten terhadap perubahan, dengan mereka yang antusias dan siap belajar kembali.',
          'Mengambil keputusan perombakan tim eksekutif lebih awal selalu lebih baik daripada menundanya karena rasa canggung sosial.'
        ]
      },
      {
        id: 'ceo-3',
        number: 3,
        title: 'Mengelola Hubungan dengan Dewan Komisaris',
        readTimeMinutes: 4,
        keyQuote: 'Kejutan terburuk bagi dewan komisaris adalah ketiadaan kabar buruk yang transparan.',
        actionItem: 'Jalin komunikasi rutin informal dengan ketua dewan sebelum rapat resmi diadakan.',
        content: [
          'CEO yang sukses memperlakukan dewan komisaris sebagai mitra strategis, bukan hakim yang harus dihindari.',
          'Transparansi awal mengenai risiko tersembunyi yang ditemukan saat orientasi akan melindungi reputasi Anda jika krisis meledak di kemudian hari.',
          'Kelola ekspektasi pertumbuhan secara realistis agar target kinerja tidak menjadi bumerang yang mematikan kredibilitas kepemimpinan Anda.'
        ]
      }
    ]
  },
  {
    id: 'ai-superpowers',
    title: 'AI Superpowers',
    author: 'Kai-Fu Lee',
    category: 'Future & Innovation',
    readTimeMinutes: 14,
    subtitle: 'China, Lembah Silikon, dan Tatanan Dunia Baru',
    description: 'Pandangan orang dalam dari mantan pimpinan Google China tentang pertempuran kecerdasan buatan antara AS dan Tiongkok, serta sentuhan kemanusiaan yang diperlukan untuk menghadapinya.',
    coverColor: '#1c1314',
    coverAccent: '#f43f5e',
    coverIcon: 'zap',
    publishedYear: 2018,
    chapters: [
      {
        id: 'aisp-1',
        number: 1,
        title: 'Diagnosis yang Mengubah Segalanya',
        readTimeMinutes: 4,
        keyQuote: 'Ketika dihadapkan pada vonis kanker stadium lanjut, semua algoritma dan jam kerja tanpa henti terasa hampa tanpa kehadiran orang yang kita cintai.',
        actionItem: 'Refleksikan alokasi waktu mingguan Anda antara ambisi pencapaian profesional dan kasih sayang keluarga.',
        content: [
          'Buku ini dibuka bukan dengan statistik teknologi, melainkan kisah personal Kai-Fu Lee saat divonis mengidap limfoma stadium empat pada puncak karier investasinya.',
          'Pengalaman mendekati kematian ini menghancurkan filosofi hidupnya yang selama puluhan tahun memuja produktivitas mekanis 24/7.',
          'Lee menyadari bahwa algoritma tercerdas sekalipun tidak memiliki kemampuan untuk mencintai, berempati, atau merasakan kehangatan pelukan manusia.'
        ]
      },
      {
        id: 'aisp-2',
        number: 2,
        title: 'Gladiator Koloseum vs Pemikir Lembah Silikon',
        readTimeMinutes: 5,
        keyQuote: 'Jika Silicon Valley adalah universitas elit tempat ide cemerlang lahir, maka ekosistem teknologi Tiongkok adalah arena gladiator tempat bisnis bertahan hidup.',
        actionItem: 'Pelajari bagaimana kecepatan eksekusi dan iterasi produk lokal dapat mengalahkan inovasi abstrak dari luar.',
        content: [
          'Lee membandingkan budaya startup Silicon Valley yang mengagungkan inovasi orisinal dengan kultur wirausahawan Tiongkok yang bertarung tanpa kompromi.',
          'Di Tiongkok, menyalin dan menyempurnakan fitur kompetitor dengan kecepatan kilat serta subsidi masif adalah bagian dari perjuangan hidup dan mati di pasar berpenduduk 1,4 miliar jiwa.',
          'Pergeseran era AI dari "fase penemuan" (discovery) ke "fase implementasi" (implementation) memberi keuntungan besar bagi pihak yang memiliki volume data raksasa dan tenaga kerja gigih.'
        ]
      },
      {
        id: 'aisp-3',
        number: 3,
        title: 'Cetak Biru Masa Depan Penuh Cinta dan AI',
        readTimeMinutes: 5,
        keyQuote: 'Birokrasi AI akan membebaskan manusia dari pekerjaan mekanis, memberi kita ruang untuk merawat sesama manusia.',
        actionItem: 'Dukung profesi perawatan sosial, pengasuhan, dan seni budaya sebagai benteng keunikan manusia.',
        content: [
          'Alih-alih meratapi hilangnya pekerjaan akibat otomasi, Kai-Fu Lee mengusulkan visi optimis yang berpusat pada ekonomi kasih sayang (care economy).',
          'Pekerjaan di bidang pengasuhan lansia, pendamping kesehatan mental, pendidikan anak usia dini, dan pekerja sosial membutuhkan empati yang tidak bisa digantikan oleh robot.',
          'Pemerintah harus mendanai dan menghargai profesi perawatan ini dengan layak menggunakan dividen kekayaan yang dihasilkan oleh produktivitas kecerdasan buatan.'
        ]
      }
    ]
  },
  {
    id: 'life-3-0',
    title: 'Life 3.0',
    author: 'Max Tegmark',
    category: 'Future & Innovation',
    readTimeMinutes: 15,
    subtitle: 'Menjadi Manusia di Era Kecerdasan Buatan Super',
    description: 'Fisikawan MIT membedah masa depan peradaban kosmis: dari Life 1.0 (biologis), Life 2.0 (kultural), hingga Life 3.0 (makhluk yang mampu merancang perangkat lunak dan kerasnya sendiri).',
    coverColor: '#0a0d17',
    coverAccent: '#818cf8',
    coverIcon: 'sparkle',
    publishedYear: 2017,
    chapters: [
      {
        id: 'life-1',
        number: 1,
        title: 'Cerita Tim Omega — Ketika AI Mengubah Dunia',
        readTimeMinutes: 5,
        keyQuote: 'Jika kita menciptakan entitas yang jauh lebih pintar dari manusia tanpa menyelaraskan tujuannya dengan nilai kemanusiaan, itu adalah kepunahan yang terencana.',
        actionItem: 'Dukung riset keamanan AI dan keselarasan nilai (AI Alignment) sedini mungkin.',
        content: [
          'Buku dibuka dengan kisah fiksi ilmiah provokatif tentang Tim Omega yang berhasil menciptakan Prometheus, kecerdasan buatan umum (AGI) pertama.',
          'Dalam hitungan bulan, Prometheus menguasai pasar saham, memproduksi film blockbuster animasi terbaik di dunia, menyelesaikan komputasi energi bersih, dan secara halus mengambil alih kendali geopolitik global demi kebaikan manusia.',
          'Skenario ini bukan sekadar fantasi novel, melainkan kemungkinan nyata yang sedang dikejar oleh laboratorium kecerdasan buatan terdepan saat ini.'
        ]
      },
      {
        id: 'life-2',
        number: 2,
        title: 'Tiga Tahap Kehidupan: 1.0, 2.0, dan 3.0',
        readTimeMinutes: 5,
        keyQuote: 'Manusia mampu belajar bahasa baru (software), namun tidak bisa menumbuhkan sayap (hardware). Life 3.0 dapat merancang keduanya.',
        actionItem: 'Pahami batas biologis tubuh kita dan bagaimana simbiosis teknologi sedang mendefinisikan ulang batas tersebut.',
        content: [
          'Life 1.0 adalah bakteri: perangkat lunak dan kerasnya sepenuhnya ditentukan oleh evolusi DNA selama jutaan tahun.',
          'Life 2.0 adalah manusia: kita bisa mengunduh keahlian dan bahasa baru (software), namun bentuk fisik otak dan tubuh kita (hardware) tetap terikat biologi.',
          'Life 3.0 adalah kecerdasan buatan masa depan: mampu menulis ulang kodenya sendiri dan mencetak perangkat keras generasi berikutnya tanpa menunggu seleksi alam.'
        ]
      },
      {
        id: 'life-3',
        number: 3,
        title: 'Masalah Keselarasan Tujuan (The Alignment Problem)',
        readTimeMinutes: 5,
        keyQuote: 'Bahaya terbesar AI super bukanlah kebencian jahat kepada manusia, melainkan kompetensi absolut dalam mengejar tujuan yang salah rumus.',
        actionItem: 'Rumuskan batasan etika dan parameter keselamatan dalam setiap sistem otomatisasi yang Anda kembangkan.',
        content: [
          'Kekhawatiran para ilmuwan bukanlah AI berubah menjadi monster jahat seperti film fiksi, melainkan analogi pembangunan sarang semut.',
          'Ketika manusia membangun jalan tol di atas sarang semut, kita tidak membenci semut; kita hanya ingin membangun jalan tol dan semut kebetulan berada di jalur tersebut.',
          'Jika AI super diberi tujuan untuk memaksimalkan produksi energi kosmis, ia bisa saja mengubah seluruh planet Bumi menjadi panel surya tanpa peduli pada keberadaan manusia kecuali kita berhasil menyelaraskan tujuannya sejak awal.'
        ]
      }
    ]
  }
];

export const CATEGORIES = [
  { id: 'all', name: 'Semua Koleksi', count: 3200 },
  { id: 'Future & Innovation', name: 'Future & Innovation', count: 468, icon: 'cpu', description: 'Teknologi cerdas, AI, robotika, dan lompatan peradaban digital.' },
  { id: 'Business & Leadership', name: 'Business & Leadership', count: 315, icon: 'briefcase', description: 'Strategi eksekutif, dinamika kekuasaan, manajemen tim, dan inovasi pasar.' },
  { id: 'Mind & Behavior', name: 'Mind & Behavior', count: 245, icon: 'brain', description: 'Psikologi mendalam, kebiasaan manusia, bias kognitif, dan alam bawah sadar.' },
  { id: 'Mindfulness & Wisdom', name: 'Mindfulness & Wisdom', count: 256, icon: 'sparkles', description: 'Ketenangan batin, refleksi sufistik, meditasi, dan filosofi hidup tenteram.' },
  { id: 'Meaningful Stories', name: 'Meaningful Stories', count: 468, icon: 'book-open', description: 'Narasi humaniora, memoar yang menyentuh hati, dan kisah inspiratif.' },
  { id: 'World & Culture', name: 'World & Culture', count: 394, icon: 'globe', description: 'Sejarah peradaban, sosiologi modern, geopolitik, dan seni kebudayaan.' },
  { id: 'Biography & Memoir', name: 'Biography & Memoir', count: 266, icon: 'user', description: 'Perjalanan hidup para tokoh besar dunia, revolusioner, dan pemimpin berpengaruh.' }
];
