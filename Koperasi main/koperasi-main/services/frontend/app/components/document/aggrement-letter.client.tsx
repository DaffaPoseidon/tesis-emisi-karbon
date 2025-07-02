import { Document, Font, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

Font.register({
  family: "Roboto",
  fonts: [
    {
      src: "https://fonts.gstatic.com/s/roboto/v27/KFOmCnqEu92Fr1Mu4mxP.ttf",
      fontWeight: "normal",
    },
    {
      src: "https://fonts.gstatic.com/s/roboto/v27/KFOlCnqEu92Fr1MmWUlfBBc9.ttf",
      fontWeight: "bold",
    },
    {
      src: "https://fonts.gstatic.com/s/roboto/v27/KFOkCnqEu92Fr1Mu51xIIzc.ttf",
      fontWeight: "normal",
      fontStyle: "italic",
    },
  ],
});

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 40,
    fontFamily: "Roboto",
  },
  header: {
    marginBottom: 20,
    textAlign: "center",
  },
  title: {
    fontSize: 18,
    marginBottom: 10,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 20,
  },
  section: {
    marginBottom: 10,
  },
  table: {
    width: "auto",
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: "row",
  },
  tableCol1: {
    width: "25%",
  },
  tableCol2: {
    width: "5%",
  },
  tableCol3: {
    width: "70%",
  },
  text: {
    fontFamily: "Roboto",
    fontSize: 12,
    marginBottom: 5,
  },
  bold: {
    fontFamily: "Roboto",
    fontWeight: "bold",
  },
  signatureSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 50,
  },
  signatureBox: {
    width: "40%",
    textAlign: "center",
  },
  signatureLine: {
    borderBottomWidth: 1,
    borderBottomColor: "#000000",
    marginTop: 40,
    marginBottom: 10,
  },
  signatureLineEmpty: {
    borderBottomWidth: 1,
    borderBottomColor: "#000000",
    marginTop: 90,
    marginBottom: 10,
  },
});

export interface AgreementProps {
  idProjek: string;
  idUser: string;
  namaProyek: string;
  namaPetugas: string;
  alamatPetugas: string;
  namaPemilikProyek: string;
  nik: string;
  noHp: string;
  alamat: string;
  tandaTangan: string;
  signature: string;
  nominalDisetujui: string;
  tanggal: string;
}

const AgreementPDF: React.FC<AgreementProps> = ({
  namaProyek,
  namaPetugas,
  alamatPetugas,
  namaPemilikProyek,
  nik,
  noHp,
  alamat,
  tandaTangan,
  signature,
  nominalDisetujui,
  tanggal,
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>SURAT PERJANJIAN KERJASAMA</Text>
        <Text style={styles.subtitle}>Nomor : 001/SPK/RSB/.........................</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.text}>Yang bertanda tangan dibawah ini :</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={styles.tableCol1}>
              <Text style={styles.text}>Nama</Text>
            </View>
            <View style={styles.tableCol2}>
              <Text style={styles.text}>:</Text>
            </View>
            <View style={styles.tableCol3}>
              <Text style={styles.text}>{namaPetugas}</Text>
            </View>
          </View>
          <View style={styles.tableRow}>
            <View style={styles.tableCol1}>
              <Text style={styles.text}>Jabatan</Text>
            </View>
            <View style={styles.tableCol2}>
              <Text style={styles.text}>:</Text>
            </View>
            <View style={styles.tableCol3}>
              <Text style={styles.text}>-</Text>
            </View>
          </View>
          <View style={styles.tableRow}>
            <View style={styles.tableCol1}>
              <Text style={styles.text}>Instansi</Text>
            </View>
            <View style={styles.tableCol2}>
              <Text style={styles.text}>:</Text>
            </View>
            <View style={styles.tableCol3}>
              <Text style={styles.text}>Koperasi Rejeki Sukses Berkah</Text>
            </View>
          </View>
          <View style={styles.tableRow}>
            <View style={styles.tableCol1}>
              <Text style={styles.text}>Alamat</Text>
            </View>
            <View style={styles.tableCol2}>
              <Text style={styles.text}>:</Text>
            </View>
            <View style={styles.tableCol3}>
              <Text style={styles.text}>{alamatPetugas}</Text>
            </View>
          </View>
        </View>
        <Text style={styles.text}>
          Dalam hal ini bertindak untuk dan atas nama Koperasi Rejeki Sukses Berkah, yang
          selanjutnya disebut sebagai <Text style={styles.bold}>PIHAK PERTAMA</Text>
        </Text>
      </View>

      <View style={styles.section}>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={styles.tableCol1}>
              <Text style={styles.text}>Nama</Text>
            </View>
            <View style={styles.tableCol2}>
              <Text style={styles.text}>:</Text>
            </View>
            <View style={styles.tableCol3}>
              <Text style={styles.text}>{namaPemilikProyek}</Text>
            </View>
          </View>
          <View style={styles.tableRow}>
            <View style={styles.tableCol1}>
              <Text style={styles.text}>NIK</Text>
            </View>
            <View style={styles.tableCol2}>
              <Text style={styles.text}>:</Text>
            </View>
            <View style={styles.tableCol3}>
              <Text style={styles.text}>{nik}</Text>
            </View>
          </View>
          <View style={styles.tableRow}>
            <View style={styles.tableCol1}>
              <Text style={styles.text}>Nama Proyek</Text>
            </View>
            <View style={styles.tableCol2}>
              <Text style={styles.text}>:</Text>
            </View>
            <View style={styles.tableCol3}>
              <Text style={styles.text}>{namaProyek}</Text>
            </View>
          </View>
          <View style={styles.tableRow}>
            <View style={styles.tableCol1}>
              <Text style={styles.text}>Alamat</Text>
            </View>
            <View style={styles.tableCol2}>
              <Text style={styles.text}>:</Text>
            </View>
            <View style={styles.tableCol3}>
              <Text style={styles.text}>{alamat}</Text>
            </View>
          </View>
          <View style={styles.tableRow}>
            <View style={styles.tableCol1}>
              <Text style={styles.text}>No.HP</Text>
            </View>
            <View style={styles.tableCol2}>
              <Text style={styles.text}>:</Text>
            </View>
            <View style={styles.tableCol3}>
              <Text style={styles.text}>{noHp}</Text>
            </View>
          </View>
        </View>
        <Text style={styles.text}>
          Dalam hal ini bertindak untuk dan atas nama pribadi, yang selanjutnya disebut sebagai{" "}
          <Text style={styles.bold}>PIHAK KEDUA</Text>
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.text}>
          Pada hari ini, tanggal {tanggal}, Kedua belah pihak secara sadar mengadakan perjanjian
          kontrak kerja, dengan isi sebagai berikut:
        </Text>
      </View>

      <View style={styles.section}>
        <View style={styles.header}>
          <Text style={styles.bold}>PASAL 1</Text>
          <Text style={styles.bold}>HAK DAN KEWAJIBAN</Text>
        </View>
        <Text style={styles.text}>
          1. PIHAK KEDUA telah menerima uang tunai sebesar Rp.{nominalDisetujui} ({nominalDisetujui}{" "}
          Rupiah) dari PIHAK PERTAMA yang dimana uang tunai tersebut adalah modal usaha.
        </Text>
        <Text style={styles.text}>
          2. PIHAK KEDUA berkewajiban melampirkan laporan keuangan kepada penyelenggara melalui
          email resmi PIHAK PERTAMA maupun website Koperasi Rejeki Sukses Berkah.
        </Text>
        <Text style={styles.text}>
          3. PIHAK PERTAMA berkewajiban untuk memberitahukan kepada pemodal terkait kenaikan maupun
          penurunan nilai unit proyek.
        </Text>
        <Text style={styles.text}>
          4. Apabila dikemudian hari ternyata proyek yang dijalankan PIHAK KEDUA mengalami pailit,
          maka PIHAK PERTAMA memiliki hak penuh atas barang jaminan baik untuk dimilliki pribadi
          maupun untuk dijual kepada orang lain. Hasil dari penjualan aset akan dibagikan kepada
          pemodal sesuai jumlah unit yang dimiliki.
        </Text>
      </View>

      <View style={styles.section}>
        <View style={styles.header}>
          <Text style={styles.bold}>PASAL 2</Text>
          <Text style={styles.bold}>PENYELESAIAN PERSELISIHAN</Text>
        </View>
        <Text style={styles.text}>
          1. Apabila ada hal-hal yang tidak atau belum diatur dalam perjanjian ini dan juga jika
          terjadi perbedaan penafsiran atas seluruh atau sebagian dari perjanjian ini, maka kedua
          belah pihak telah sepakat untuk menyelesaikannya secara musyawarah untuk mufakat.
        </Text>
        <Text style={styles.text}>
          2. Jika penyelesaian secara musyawarah untuk mufakat tidak menyelesaikan perselisihan
          tersebut, maka perselisihan tersebut akan diselesaikan secara hukum yang berlaku di
          Indonesia
        </Text>
      </View>

      <View style={styles.section}>
        <View style={styles.header}>
          <Text style={styles.bold}>PASAL 3</Text>
          <Text style={styles.bold}>LAIN - LAIN</Text>
        </View>
        <Text style={styles.text}>
          1. Hal-hal yang belum tercantum didalam perjanjian ini, akan diatur kemudian.
        </Text>
        <Text style={styles.text}>
          2. Segala perubahan terhadap sebagian atau seluruh pasal-pasal dalam Perjanjian Kerjasama
          ini hanya dapat dilakukan dengan persetujuan kedua belah pihak.
        </Text>
        <Text style={styles.text}>
          3. Perjanjian ini dibuat bermaterai cukup dan mempunyai kekuatan hukum.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.text}>
          Demikianlah Perjanjian Kerjasama ini dibuat oleh kedua belah pihak dalam keadaan sehat
          jasmani dan rohani tanpa adanya paksaan ataupun tekanan dari pihak manapun.
        </Text>
      </View>

      <View style={styles.signatureSection}>
        <View style={styles.signatureBox}>
          <Text style={styles.text}>PIHAK PERTAMA</Text>
          <Image src={signature} style={{ width: 100, height: 50 }} />
          <View style={styles.signatureLineEmpty} />
          <Text style={styles.text}>({namaPetugas})</Text>
        </View>
        <View style={styles.signatureBox}>
          <Text style={styles.text}>PIHAK KEDUA</Text>
          <Image src={tandaTangan} style={{ width: 100, height: 50 }} />
          <View style={styles.signatureLine} />
          <Text style={styles.text}>({namaPemilikProyek})</Text>
        </View>
      </View>
    </Page>
  </Document>
);

export default AgreementPDF;
