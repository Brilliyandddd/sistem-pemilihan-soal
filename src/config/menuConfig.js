const menuList = [
  {
    title: "Beranda",
    path: "/dashboard",
    icon: "home",
    roles: ["ROLE_ADMINISTRATOR", "ROLE_LECTURE", "ROLE_STUDENT"],
  },
  // {
  //   title: "Author Blog",
  //   path: "/doc",
  //   icon: "file",
  //   roles: ["ROLE_ADMINISTRATOR", "ROLE_LECTURE", "ROLE_STUDENT"],
  // },
  // {
  //   title: "Guide",
  //   path: "/guide",
  //   icon: "key",
  //   roles:["ROLE_ADMINISTRATOR","ROLE_LECTURE"]
  // },
  // {
  //   title: "Permission",
  //   path: "/permission",
  //   icon: "lock",
  //   children: [
  //     {
  //       title: "Deskripsi Permission",
  //       path: "/permission/explanation",
  //       roles:["ROLE_ADMINISTRATOR"]
  //     },
  //     {
  //       title: "Halaman Admin",
  //       path: "/permission/adminPage",
  //       roles:["ROLE_ADMINISTRATOR"]
  //     },
  //     {
  //       title: "Halaman Dosen",
  //       path: "/permission/lecturePage",
  //       roles:["ROLE_LECTURE"]
  //     },
  //     {
  //       title: "Halaman Siswa",
  //       path: "/permission/studentPage",
  //       roles:["ROLE_STUDENT"]
  //     },

  //   ],
  // },
  // {
  //   title: "Komponen",
  //   path: "/components",
  //   icon: "appstore",
  //   roles:["ROLE_ADMINISTRATOR","ROLE_LECTURE"],
  //   children: [
  //     {
  //       title: "Rich Text",
  //       path: "/components/richTextEditor",
  //       roles:["ROLE_ADMINISTRATOR","ROLE_LECTURE"],
  //     },
  //     {
  //       title: "Markdown",
  //       path: "/components/Markdown",
  //       roles:["ROLE_ADMINISTRATOR","ROLE_LECTURE"],
  //     },
  //     {
  //       title: "Drag List",
  //       path: "/components/draggable",
  //       roles:["ROLE_ADMINISTRATOR","ROLE_LECTURE"],
  //     },
  //   ],
  // },
  // {
  //   title: "Bagan",
  //   path: "/charts",
  //   icon: "area-chart",
  //   roles:["ROLE_ADMINISTRATOR","ROLE_LECTURE"],
  //   children: [
  //     {
  //       title: "Bagan Keyboard",
  //       path: "/charts/keyboard",
  //       roles:["ROLE_ADMINISTRATOR","ROLE_LECTURE"],
  //     },
  //     {
  //       title: "Bagan Garis",
  //       path: "/charts/line",
  //       roles:["ROLE_ADMINISTRATOR","ROLE_LECTURE"],
  //     },
  //     {
  //       title: "Bagan Campuran",
  //       path: "/charts/mix-chart",
  //       roles:["ROLE_ADMINISTRATOR","ROLE_LECTURE"],
  //     },
  //   ],
  // },
  // {
  //   title: "Menu Bersarang",
  //   path: "/nested",
  //   icon: "cluster",
  //   roles:["ROLE_ADMINISTRATOR","ROLE_LECTURE"],
  //   children: [
  //     {
  //       title: "Menu 1",
  //       path: "/nested/menu1",
  //       children: [
  //         {
  //           title: "Menu 1-1",
  //           path: "/nested/menu1/menu1-1",
  //           roles:["ROLE_ADMINISTRATOR","ROLE_LECTURE"],
  //         },
  //         {
  //           title: "Menu 1-2",
  //           path: "/nested/menu1/menu1-2",
  //           children: [
  //             {
  //               title: "Menu 1-2-1",
  //               path: "/nested/menu1/menu1-2/menu1-2-1",
  //               roles:["ROLE_ADMINISTRATOR","ROLE_LECTURE"],
  //             },
  //           ],
  //         },
  //       ],
  //     },
  //   ],
  // },
  // {
  //   title: "Tabel",
  //   path: "/table",
  //   icon: "table",
  //   roles:["ROLE_ADMINISTRATOR","ROLE_LECTURE"]
  // },
  // {
  //   title: "Excel",
  //   path: "/excel",
  //   icon: "file-excel",
  //   roles: ["ROLE_ADMINISTRATOR", "ROLE_LECTURE"],
  //   children: [
  //     {
  //       title: "Export Excel",
  //       path: "/excel/export",
  //       roles: ["ROLE_ADMINISTRATOR", "ROLE_LECTURE"],
  //     },
  //     {
  //       title: "Export Excel",
  //       path: "/excel/upload",
  //       roles: ["ROLE_ADMINISTRATOR", "ROLE_LECTURE"],
  //     },
  //   ],
  // },
  // {
  //   title: "Zip",
  //   path: "/zip",
  //   icon: "file-zip",
  //   roles: ["ROLE_ADMINISTRATOR", "ROLE_LECTURE"],
  // },
  // {
  //   title: "Papan Klip",
  //   path: "/clipboard",
  //   icon: "copy",
  //   roles:["ROLE_ADMINISTRATOR","ROLE_LECTURE"]
  // },

  // Admin
  {
    title: "Master Data",
    path: "/master",
    icon: "database",
    roles: ["ROLE_ADMINISTRATOR"],
    children: [
      {
        title: "Jurusan",
        path: "/department",
        icon: "apartment",
        roles: ["ROLE_ADMINISTRATOR"],
      },
      {
        title: "Prodi",
        path: "/study-program",
        icon: "appstore",
        roles: ["ROLE_ADMINISTRATOR"],
      },
      {
        title: "Agama",
        path: "/religion",
        icon: "global",
        roles: ["ROLE_ADMINISTRATOR"],
      },
      {
        title: "Rumpun Matkul",
        path: "/subject-group",
        icon: "branches",
        roles: ["ROLE_ADMINISTRATOR"],
      },
      {
        title: "Mata Kuliah",
        path: "/subject",
        icon: "audit",
        roles: ["ROLE_ADMINISTRATOR"],
      },
      {
        title: "Media Pembelajaran",
        path: "/learning-media",
        icon: "apartment",
        roles: ["ROLE_ADMINISTRATOR"],
      },
      {
        title: "Bentuk Pembelajaran",
        path: "/form-learning",
        icon: "container",
        roles: ["ROLE_ADMINISTRATOR"],
      },
      {
        title: "Metode Pembelajaran",
        path: "/learning-method",
        icon: "control",
        roles: ["ROLE_ADMINISTRATOR"],
      },
      {
        title: "Kriteria Penilaian",
        path: "/assessment-criteria",
        icon: "file-done",
        roles: ["ROLE_ADMINISTRATOR"],
      },
      {
        title: "Formulir Penilaian",
        path: "/appraisal-form",
        icon: "file-sync",
        roles: ["ROLE_ADMINISTRATOR"],
      },
    ],
  },
  
  {
    title: "Dosen",
    path: "/lecture",
    icon: "team",
    roles: ["ROLE_ADMINISTRATOR"],
  },

  {
    title: "Mahasiswa",
    path: "/student",
    icon: "team",
    roles: ["ROLE_ADMINISTRATOR"],
  },
  {
    title: "List Todo",
    path: "/list-todo-admin",
    icon: "solution",
    roles: ["ROLE_ADMINISTRATOR","ROLE_LECTURE"]
  },
  // Lecture
  {  title: "Master Soal",
    path: "/question",
    icon: "database",
    roles: ["ROLE_LECTURE","ROLE_ADMINISTRATOR"],
    children: [
      {
        title: "Kriteria Pertanyaan",
        path: "/question-criteria",
        icon: "apartment",
        roles: ["ROLE_LECTURE","ROLE_ADMINISTRATOR"],
      },
      {
        title: "Tabel Nilai Linguistik",
        path: "/linguistic-value",
        icon: "file-text",
        roles: ["ROLE_LECTURE","ROLE_ADMINISTRATOR"],
      },
      {
        title : "Pengujian Soal",
        path : "/criteria-value",
        icon : "file-search",
        // roles : ["ROLE_ADMINISTRATOR"],
        roles : ["ROLE_LECTURE","ROLE_ADMINISTRATOR"],
      },
    ],
  },
  {
    title: "List Todo",
    path: "/list-todo",
    icon: "solution",
    roles: ["ROLE_LECTURE"]
  },
  {
    title: "Pengguna",
    path: "/user",
    icon: "usergroup-add",
    roles: ["ROLE_ADMINISTRATOR"],
  },

  {
    title: "RPS",
    path: "/rps",
    icon: "radar-chart",
    roles: ["ROLE_LECTURE", "ROLE_ADMINISTRATOR"],
  },
  {
    title: "Manajemen Soal",
    path: "/question",
    icon: "file-search",
    roles: ["ROLE_ADMINISTRATOR", "ROLE_LECTURE"],
  },
  {
    title: "Setting Ujian",
    path: "/setting-exam",
    icon: "solution",
    roles: ["ROLE_ADMINISTRATOR"],
  },
  {
    title: "Setting Kuis",
    path: "/setting-quiz",
    icon: "solution",
    roles: ["ROLE_LECTURE", "ROLE_ADMINISTRATOR"],
  },
  {
    title: "Setting Latihan",
    path: "/setting-exercise",
    icon: "solution",
    roles: ["ROLE_LECTURE", "ROLE_ADMINISTRATOR"],
  },
  {
    title: "Ujian",
    path: "/exam",
    icon: "solution",
    roles: ["ROLE_STUDENT"],
  },
  {
    title: "Kuis",
    path: "/quiz",
    icon: "solution",
    roles: ["ROLE_STUDENT"],
  },
  {
    title: "Latihan",
    path: "/exercise",
    icon: "solution",
    roles: ["ROLE_STUDENT"],
  },
  {
    title: "Nilai",
    path: "/result",
    icon: "file-protect",
    roles: ["ROLE_LECTURE"],
    children: [
      {
        title: "Nilai Ujian",
        path: "/result/exam",
        roles: ["ROLE_LECTURE"],
      },
      {
        title: "Nilai Kuis",
        path: "/result/quiz",
        roles: ["ROLE_LECTURE"],
      },
      {
        title: "Nilai Latihan",
        path: "/result/exercise",
        roles: ["ROLE_LECTURE"],
      },
    ],
  },
  {
    title: "Tentang Penulis",
    path: "/about",
    icon: "copyright",
    roles: ["ROLE_ADMINISTRATOR", "ROLE_LECTURE", "ROLE_STUDENT"],
  },

  // {
  //   title: "Bug收集",
  //   path: "/bug",
  //   icon: "bug",
  //   roles:["ROLE_ADMINISTRATOR"]
  // },
];
export default menuList;
