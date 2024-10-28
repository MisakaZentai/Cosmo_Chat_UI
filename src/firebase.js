// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// 从 Firebase 控制台复制您的 Firebase 配置
const firebaseConfig = {
    apiKey: "AIzaSyD8BZCzSDh6v-Kc-JTCCVaNGYlfjyGR0q8",
    authDomain: "cosmos-core-e19a2.firebaseapp.com",
    projectId: "cosmos-core-e19a2",
    storageBucket: "cosmos-core-e19a2.appspot.com",
    messagingSenderId: "629192156833",
    appId: "1:629192156833:web:c405c24a7821058fdf32e0",
    measurementId: "G-WVYJXM4DN7"
  };

// 初始化 Firebase 应用
const app = initializeApp(firebaseConfig);

// 初始化 Firestore 数据库
const db = getFirestore(app);

export { db };