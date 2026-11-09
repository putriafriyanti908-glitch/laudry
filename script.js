// =============================================
// LAUNDRYKU - APLIKASI MANAJEMEN LAUNDRY
// CRUD + LOCAL STORAGE
// =============================================

// 1. MENGAMBIL ELEMEN HTML
const formLaundry = document.getElementById('form-laundry');
const inputEditId = document.getElementById('edit-id');
const inputNama = document.getElementById('nama-pelanggan');
const inputBerat = document.getElementById('berat-kg');
const inputStatus = document.getElementById('status-cuci');

const btnSimpan = document.getElementById('btn-simpan');
const btnBatal = document.getElementById('btn-batal');
const btnHapusSemua = document.getElementById('btn-hapus-semua');

const judulForm = document.getElementById('judul-form');
const wadahPesanan = document.getElementById('wadah-pesanan');

// ELEMEN STATISTIK
const elTotalPesanan = document.getElementById('total-pesanan');
const elTotalAntri = document.getElementById('total-antri');
const elTotalProses = document.getElementById('total-proses');
const elTotalSelesai = document.getElementById('total-selesai');

// 2. PENGATURAN
const HARGA_PER_KG = 5000;
const KEY_STORAGE = 'dataLaundry';

let daftarPesanan = [];

// 3. MEMBACA LOCAL STORAGE
function ambilData() {
    try {
        const data = JSON.parse(localStorage.getItem(KEY_STORAGE));

        daftarPesanan = Array.isArray(data) ? data : [];
    } catch (error) {
        daftarPesanan = [];
        console.error('Gagal membaca data:', error);
    }
}

// 4. MENYIMPAN DATA
function simpanKeGudang(data) {
    try {
        localStorage.setItem(KEY_STORAGE, JSON.stringify(data));
        daftarPesanan = data;
        return true;
    } catch (error) {
        alert('Data gagal disimpan. Periksa penyimpanan browser!');
        console.error(error);
        return false;
    }
}

// 5. FORMAT RUPIAH
function formatRupiah(angka) {
    return angka.toLocaleString('id-ID');
}

// 6. MENAMPILKAN PESANAN
function renderPesanan() {

    // HITUNG STATISTIK
    elTotalPesanan.textContent = daftarPesanan.length;

    elTotalAntri.textContent = daftarPesanan.filter(
        p => p.status === 'Antri'
    ).length;

    elTotalProses.textContent = daftarPesanan.filter(
        p => p.status === 'Proses'
    ).length;

    elTotalSelesai.textContent = daftarPesanan.filter(
        p => p.status === 'Selesai'
    ).length;

    // KOSONGKAN DAFTAR
    wadahPesanan.innerHTML = '';

    // JIKA BELUM ADA PESANAN
    if (daftarPesanan.length === 0) {
        const kosong = document.createElement('div');
        kosong.className = 'empty-state';

        const teks = document.createElement('p');
        teks.textContent =
            '📭 Belum ada pesanan. Tambahkan pesanan pertama di atas!';

        kosong.appendChild(teks);
        wadahPesanan.appendChild(kosong);

        return;
    }

    // TAMPILKAN SEMUA PESANAN
    daftarPesanan.forEach(function(p) {

        const totalHarga = p.berat * HARGA_PER_KG;

        // KARTU
        const kartu = document.createElement('div');
        kartu.className = 'kartu-pesanan';

        // INFORMASI PELANGGAN
        const info = document.createElement('div');
        info.className = 'info-pesanan';

        const nama = document.createElement('div');
        nama.className = 'nama-pelanggan-kartu';
        nama.textContent = p.nama;

        const detail = document.createElement('div');
        detail.className = 'detail-pesanan';

        detail.textContent =
            `⚖️ ${p.berat} kg | 💰 Rp ${formatRupiah(totalHarga)}`;

        info.append(nama, detail);

        // STATUS
        const status = document.createElement('span');
        status.className = 'badge-status badge-' + p.status;
        status.textContent = p.status;

        // TOMBOL AKSI
        const aksi = document.createElement('div');
        aksi.className = 'aksi-pesanan';

        const tombolEdit = document.createElement('button');
        tombolEdit.type = 'button';
        tombolEdit.className = 'btn btn-edit';
        tombolEdit.textContent = '✏️ Edit';

        tombolEdit.addEventListener('click', function() {
            mulaiEdit(p.id);
        });

        const tombolHapus = document.createElement('button');
        tombolHapus.type = 'button';
        tombolHapus.className = 'btn btn-hapus';
        tombolHapus.textContent = '🗑️ Hapus';

        tombolHapus.addEventListener('click', function() {
            hapusPesanan(p.id);
        });

        aksi.append(tombolEdit, tombolHapus);

        kartu.append(info, status, aksi);

        wadahPesanan.appendChild(kartu);
    });
}

// 7. TAMBAH DAN EDIT PESANAN
formLaundry.addEventListener('submit', function(event) {

    event.preventDefault();

    const nama = inputNama.value.trim();
    const berat = Number(inputBerat.value);
    const status = inputStatus.value;
    const idEdit = inputEditId.value;

    // VALIDASI
    if (nama === '') {
        alert('Nama pelanggan wajib diisi!');
        inputNama.focus();
        return;
    }

    if (!Number.isFinite(berat) || berat < 1) {
        alert('Berat cucian minimal 1 kg!');
        inputBerat.focus();
        return;
    }

    if (!['Antri', 'Proses', 'Selesai'].includes(status)) {
        alert('Status pesanan tidak valid!');
        return;
    }

    // MODE EDIT
    if (idEdit !== '') {

        const index = daftarPesanan.findIndex(
            p => String(p.id) === idEdit
        );

        if (index === -1) {
            alert('Pesanan tidak ditemukan!');
            batalEdit();
            return;
        }

        const dataBaru = [...daftarPesanan];

        dataBaru[index] = {
            ...dataBaru[index],
            nama: nama,
            berat: berat,
            status: status
        };

        if (simpanKeGudang(dataBaru)) {
            alert('Pesanan berhasil diperbarui!');
            batalEdit();
            renderPesanan();
        }

    } else {

        // MODE TAMBAH
        const pesananBaru = {
            id: Date.now().toString() + Math.random().toString(16).slice(2),
            nama: nama,
            berat: berat,
            status: status
        };

        const dataBaru = [...daftarPesanan, pesananBaru];

        if (simpanKeGudang(dataBaru)) {
            alert('Pesanan berhasil ditambahkan!');
            formLaundry.reset();
            renderPesanan();
        }
    }
});

// 8. MULAI EDIT
function mulaiEdit(idTarget) {

    const pesanan = daftarPesanan.find(
        p => String(p.id) === String(idTarget)
    );

    if (!pesanan) {
        alert('Pesanan tidak ditemukan!');
        return;
    }

    inputEditId.value = pesanan.id;
    inputNama.value = pesanan.nama;
    inputBerat.value = pesanan.berat;
    inputStatus.value = pesanan.status;

    judulForm.textContent = '✏️ Mode Edit Pesanan';
    btnSimpan.textContent = '💾 Simpan Perubahan';

    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// 9. BATAL EDIT
function batalEdit() {

    inputEditId.value = '';

    formLaundry.reset();

    judulForm.textContent = '✏️ Tambah Pesanan Baru';
    btnSimpan.textContent = '+ Tambah Pesanan';
}

btnBatal.addEventListener('click', batalEdit);

// 10. HAPUS SATU PESANAN
function hapusPesanan(idTarget) {

    const yakin = confirm(
        'Yakin ingin menghapus pesanan ini?'
    );

    if (!yakin) return;

    const dataBaru = daftarPesanan.filter(
        p => String(p.id) !== String(idTarget)
    );

    if (simpanKeGudang(dataBaru)) {

        if (String(inputEditId.value) === String(idTarget)) {
            batalEdit();
        }

        renderPesanan();
        alert('Pesanan berhasil dihapus!');
    }
}

// 11. HAPUS SEMUA PESANAN
function hapusSemua() {

    if (daftarPesanan.length === 0) {
        alert('Belum ada pesanan untuk dihapus!');
        return;
    }

    const yakin = confirm(
        'PERINGATAN! Semua pesanan akan dihapus. Lanjutkan?'
    );

    if (!yakin) return;

    if (simpanKeGudang([])) {
        batalEdit();
        renderPesanan();
        alert('Semua pesanan berhasil dihapus!');
    }
}

btnHapusSemua.addEventListener('click', hapusSemua);

// 12. JALANKAN APLIKASI
ambilData();
renderPesanan();

console.log('LaundryKu berhasil dijalankan!');