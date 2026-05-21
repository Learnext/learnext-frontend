export const FAKE_CONTENT = [
  {
    id: 1,
    title: "Chương 1: Giới thiệu",
    order: 1,

    sections: [
      {
        id: 1,
        title: "Phần 1: Tổng quan",
        order: 1,

        lessons: [
          {
            id: 1,
            title: "Bài 1: Giới thiệu khóa học",
            type: "video",
            file: "intro.mp4",
            duration: "5:00",
          },
          {
            id: 2,
            title: "Bài 2: Cài đặt môi trường",
            type: "pdf",
            file: "setup.pdf",
            duration: null,
          },
        ],
      },
    ],
  },

  {
    id: 2,
    title: "Chương 2: Nội dung chính",
    order: 2,

    sections: [
      {
        id: 2,
        title: "Phần 1: Kiến thức cơ bản",
        order: 1,

        lessons: [
          {
            id: 3,
            title: "Bài 1: Khái niệm cơ bản",
            type: "video",
            file: "basic.mp4",
            duration: "10:00",
          },
        ],
      },
    ],
  },
];
