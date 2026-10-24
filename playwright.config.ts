import {defineConfig} from '@playwright/test';
export default defineConfig({testDir:'tests',testMatch:'**/*.spec.ts',timeout:120000,expect:{timeout:15000},use:{baseURL:'http://127.0.0.1:4173',headless:true},projects:[{name:'desktop',use:{viewport:{width:1440,height:1000}}},{name:'mobile',use:{viewport:{width:390,height:844}}}],reporter:'list'});
