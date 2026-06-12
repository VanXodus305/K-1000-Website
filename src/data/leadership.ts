export type LeadershipMember = {
  name: string;
  position: string;
  branch: string;
  image: string;
};

export type LeadershipLevel = {
  level: number;
  title: string;
  members: LeadershipMember[];
};

export type LeadershipData = {
  hierarchy: LeadershipLevel[];
};

const PLACEHOLDER_IMAGE = "/k1000-small.png";

export const leadership: LeadershipData = {
  hierarchy: [
    {
      level: 1,
      title: "Presidential Council",
      members: [
        
        {
          name: "Soumyadeep Kundu",
          position: "Student President",
          branch: "",
          image:
            "https://res.cloudinary.com/vanxodus305/image/upload/w_1024,ar_1:1,c_auto,g_auto/v1754426049/K-1000/_MG_0544_a5ongf.jpg",
        },
        {
          name: "Kumari Shreshtha",
          position: "General Secretary",
          branch: "",
          image:
            "https://res.cloudinary.com/vanxodus305/image/upload/w_1024,ar_1:1,c_auto,g_auto/v1754423647/K-1000/Shreshtha_vbupcc.jpg",
        },
        {
          name: "Vansh Pratap Singh",
          position: "Vice President",
          branch: "",
          image:PLACEHOLDER_IMAGE,
        },
        {
          name: "Gargie Chandra",
          position: "Joint Secretary",
          branch: "",
          image:PLACEHOLDER_IMAGE,
        },
      ],
    },
    {
      level: 2,
      title: "Senior Executive Council",
      members: [
        {
          name: "Abhishek Singhal",
          position: "Director",
          branch: "Training Programme",
          image:
            "https://res.cloudinary.com/vanxodus305/image/upload/w_1024,ar_1:1,c_auto,g_auto/v1754423643/K-1000/IMG20250329151257_4_fvcs88.jpg",
        },
        {
          name: "Aryan De",
          position: "Director",
          branch: "Higher Studies",
          image:
            "https://res.cloudinary.com/vanxodus305/image/upload/w_1024,ar_1:1,c_auto,g_auto/v1754423640/K-1000/Aryan_De_xbljob.jpg",
        },
        {
          name: "Himanshu Patel",
          position: "Director",
          branch: "Event Management",
          image:
            "https://res.cloudinary.com/vanxodus305/image/upload/w_1024,ar_1:1,c_auto,g_auto/v1754856194/K-1000/WhatsApp_Image_2025-08-11_at_00.49.33_pfzz7t.jpg",
        },
        {
          name: "Ankit Mukherjee",
          position: "Director",
          branch: "Academic Internship & Placement Guidance",
          image:
            "https://res.cloudinary.com/vanxodus305/image/upload/w_1024,ar_1:1,c_auto,g_auto/v1765266511/K-1000/ajjkzt4yi9ti9g6xe5ci.jpg",
        },
        {
          name: "Biswadeep Dev",
          position: "Director",
          branch: "Finance and Entrepreneurship",
          image:
            "https://res.cloudinary.com/vanxodus305/image/upload/w_1024,ar_1:1,c_auto,g_auto/v1754423640/K-1000/Biswadeep_Dev_q6bxdc.jpg",
        },
        {
          name: "Kislaya Srivastava",
          position: "Director",
          branch: "Project Wing",
          image:PLACEHOLDER_IMAGE,
        },
        {
          name: "Anjishnu Saw",
          position: "Director",
          branch: "Research & Publications",
          image:PLACEHOLDER_IMAGE,
        },
        {
          name: "Tvisha Tiwary",
          position: "Chief Strategy Officer",
          branch: "Office of Strategy and Growth",
          image:
            "https://res.cloudinary.com/vanxodus305/image/upload/w_1024,ar_1:1,c_auto,g_auto/v1754423648/K-1000/Tvisha_Tiwary_txlog0.jpg",
        },
        {
          name: "Ishika Jaiswal",
          position: "Chief Technical Officer",
          branch: "Office of Technology and Innovation",
          image:
            "https://res.cloudinary.com/e-labs-members/image/upload/w_1024,ar_3:4,c_fill,g_face,f_auto/v1741880378/snqcicj3nkzfqur9clsh.jpg",
        },
        {
          name: "Brhadyuti Bhattacharjee",
          position: "Chief Communications Officer",
          branch: "Office of Content and Communication",
          image:
            "https://res.cloudinary.com/vanxodus305/image/upload/w_1024,ar_1:1,c_auto,g_auto,f_auto/v1776323181/K-1000/vkss4mxwgs5xvxq5likd.jpg",
        },
        {
          name: "Sanskrita Baishya",
          position: "Chief Campus Ambassador",
          branch: "Office of Campus Ambassador",
          image: PLACEHOLDER_IMAGE,
        },
        {
          name: "Yash Sinha",
          position: "Chief Public & Corporate Relations Officer",
          branch: "Office of Public & Corporate Relations",
          image:PLACEHOLDER_IMAGE,
        },
        {
          name: "Sourav Basak",
          position: "Chief Creative Officer",
          branch: "Office of Creativity and Design",
          image:
            "https://res.cloudinary.com/vanxodus305/image/upload/w_1024,ar_1:1,c_auto,g_auto,f_auto/v1754856115/K-1000/IMG_0309_rbu35s.jpg",
        },
      ],
    },
    {
      level: 3,
      title: "Junior Executive Council",
      members: [
        {
          name: "Shaambhavi Narayan",
          position: "Deputy Director",
          branch: "Training Programme",
          image:PLACEHOLDER_IMAGE,
        },
        {
          name: "Debansh Hota",
          position: "Deputy Director",
          branch: "Higher Studies",
          image:PLACEHOLDER_IMAGE,
        },
        {
          name: "Tasarun Nasreen",
          position: "Deputy Director",
          branch: "Event Management",
          image:PLACEHOLDER_IMAGE,
        },
        {
          name: "Mohneesh Purohit",
          position: "Deputy Director",
          branch: "Academic Internship & Placement Guidance",
          image:PLACEHOLDER_IMAGE,
        },
        {
          name: "Rajdweep Borah",
          position: "Deputy Director",
          branch: "Finance and Entrepreneurship",
          image:PLACEHOLDER_IMAGE,
        },
        {
          name: "Amit Kumar",
          position: "Deputy Director",
          branch: "Project Wing",
          image:PLACEHOLDER_IMAGE,
        },
        {
          name: "Ashmita Banik",
          position: "Deputy Director",
          branch: "Research & Publications",
          image:PLACEHOLDER_IMAGE,
        },
        {
          name: "Goutham Gaddam",
          position: "Deputy Chief Strategy Officer",
          branch: "Office of Strategy and Growth",
          image:PLACEHOLDER_IMAGE,
        },
        {
          name: "Rohan Chatterjee",
          position: "Deputy Chief Technical Officer",
          branch: "Office of Technology and Innovation",
          image:PLACEHOLDER_IMAGE,
        },
        {
          name: "Anwesha Dutta",
          position: "Deputy Chief Communications Officer",
          branch: "Office of Content and Communication",
          image:PLACEHOLDER_IMAGE,
        },
        {
          name: "Parnol Kashyap",
          position: "Deputy Chief Campus Ambassador",
          branch: "Office of Campus Ambassador",
          image: PLACEHOLDER_IMAGE,
        },
        {
          name: "Laksha Mandiye",
          position: "Deputy Chief Public & Corporate Relations Officer",
          branch: "Office of Public & Corporate Relations",
          image:PLACEHOLDER_IMAGE,
        },
        {
          name: "Satwik",
          position: "Deputy Chief Creative Officer",
          branch: "Office of Creativity and Design",
          image:PLACEHOLDER_IMAGE,
        },
      ],
    },
  ],
};
