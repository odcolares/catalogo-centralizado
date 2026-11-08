// Entry da versão CLIENTE (público) — importa a fonte SEM custos
import data from '../catalog-public.json';
import { initApp, type CatalogData } from './app';

initApp(data as CatalogData, 'cliente');
