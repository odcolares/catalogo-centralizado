-- Seed data for catalog schema
-- Generated from catalog-data.json

-- Insert categories
INSERT INTO categories (id, name, icon, sort_order, active) VALUES ('smartwatches', 'Smartwatches', '⌚', 0, true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, icon = EXCLUDED.icon;
INSERT INTO categories (id, name, icon, sort_order, active) VALUES ('fones', 'Fones de Ouvido', '🎧', 0, true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, icon = EXCLUDED.icon;
INSERT INTO categories (id, name, icon, sort_order, active) VALUES ('informatica', 'Informática', '🖱️', 0, true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, icon = EXCLUDED.icon;
INSERT INTO categories (id, name, icon, sort_order, active) VALUES ('eletronicos', 'Eletrônicos', '🔊', 0, true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, icon = EXCLUDED.icon;
INSERT INTO categories (id, name, icon, sort_order, active) VALUES ('cameras', 'Câmeras e Webcams', '📸', 0, true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, icon = EXCLUDED.icon;
INSERT INTO categories (id, name, icon, sort_order, active) VALUES ('acessorios', 'Acessórios para Celular', '📱', 0, true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, icon = EXCLUDED.icon;
INSERT INTO categories (id, name, icon, sort_order, active) VALUES ('armazenamento', 'Armazenamento de Dados', '💾', 0, true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, icon = EXCLUDED.icon;

-- Insert products
INSERT INTO products (id, code, name, category_id, cost, price, price_max, highlights, tags, image_url, status, visible_to_client, qty_on_hand, track_stock, updated_by)
VALUES ('d20', 'V18 Smart D20', 'Smartwatch D20 Bluetooth', 'smartwatches', 13.8, 49.9, 149.9, '["Diversas cores", "Notifica\u00e7\u00f5es no pulso", "Bateria dura o dia todo"]', '["entrada", "mais-vendido"]', 'images/d20.jpg', 'active', true, 0, true, 'seed-script')
ON CONFLICT (id) DO UPDATE SET
    code = EXCLUDED.code,
    name = EXCLUDED.name,
    category_id = EXCLUDED.category_id,
    cost = EXCLUDED.cost,
    price = EXCLUDED.price,
    price_max = EXCLUDED.price_max,
    highlights = EXCLUDED.highlights,
    tags = EXCLUDED.tags,
    image_url = EXCLUDED.image_url,
    status = EXCLUDED.status,
    updated_by = EXCLUDED.updated_by;
INSERT INTO products (id, code, name, category_id, cost, price, price_max, highlights, tags, image_url, status, visible_to_client, qty_on_hand, track_stock, updated_by)
VALUES ('d18s', 'V13 Smart D18s', 'Smartwatch D18s Bluetooth', 'smartwatches', 16.5, 49.9, 129.9, '["Design cl\u00e1ssico", "Diversas cores", "Notifica\u00e7\u00f5es b\u00e1sicas"]', '["entrada"]', '', 'inactive', true, 0, true, 'seed-script')
ON CONFLICT (id) DO UPDATE SET
    code = EXCLUDED.code,
    name = EXCLUDED.name,
    category_id = EXCLUDED.category_id,
    cost = EXCLUDED.cost,
    price = EXCLUDED.price,
    price_max = EXCLUDED.price_max,
    highlights = EXCLUDED.highlights,
    tags = EXCLUDED.tags,
    image_url = EXCLUDED.image_url,
    status = EXCLUDED.status,
    updated_by = EXCLUDED.updated_by;
INSERT INTO products (id, code, name, category_id, cost, price, price_max, highlights, tags, image_url, status, visible_to_client, qty_on_hand, track_stock, updated_by)
VALUES ('s11mini', 'Reloja1-2', 'Smart Watch S11 Mini', 'smartwatches', 33, 109.9, 119.9, '["39mm S\u00e9rie 10", "2 pulseiras", "Alto valor percebido"]', '["intermediario"]', 'images/s11mini.png', 'active', true, 0, true, 'seed-script')
ON CONFLICT (id) DO UPDATE SET
    code = EXCLUDED.code,
    name = EXCLUDED.name,
    category_id = EXCLUDED.category_id,
    cost = EXCLUDED.cost,
    price = EXCLUDED.price,
    price_max = EXCLUDED.price_max,
    highlights = EXCLUDED.highlights,
    tags = EXCLUDED.tags,
    image_url = EXCLUDED.image_url,
    status = EXCLUDED.status,
    updated_by = EXCLUDED.updated_by;
INSERT INTO products (id, code, name, category_id, cost, price, price_max, highlights, tags, image_url, status, visible_to_client, qty_on_hand, track_stock, updated_by)
VALUES ('cu10ultra', 'Reloja5-2', 'Smartwatch CU10 Ultra', 'smartwatches', 38.5, 99.9, 119.9, '["Design Ultra", "2 pulseiras", "Estilo premium"]', '["intermediario"]', '', 'inactive', true, 0, true, 'seed-script')
ON CONFLICT (id) DO UPDATE SET
    code = EXCLUDED.code,
    name = EXCLUDED.name,
    category_id = EXCLUDED.category_id,
    cost = EXCLUDED.cost,
    price = EXCLUDED.price,
    price_max = EXCLUDED.price_max,
    highlights = EXCLUDED.highlights,
    tags = EXCLUDED.tags,
    image_url = EXCLUDED.image_url,
    status = EXCLUDED.status,
    updated_by = EXCLUDED.updated_by;
INSERT INTO products (id, code, name, category_id, cost, price, price_max, highlights, tags, image_url, status, visible_to_client, qty_on_hand, track_stock, updated_by)
VALUES ('gl09', 'Reloja20-1', 'Smartwatch GL09', 'smartwatches', 47, 129.9, 149.9, '["Conex\u00e3o Celular + Bluetooth", "Chamadas", "Design moderno"]', '["intermediario"]', '', 'inactive', true, 0, true, 'seed-script')
ON CONFLICT (id) DO UPDATE SET
    code = EXCLUDED.code,
    name = EXCLUDED.name,
    category_id = EXCLUDED.category_id,
    cost = EXCLUDED.cost,
    price = EXCLUDED.price,
    price_max = EXCLUDED.price_max,
    highlights = EXCLUDED.highlights,
    tags = EXCLUDED.tags,
    image_url = EXCLUDED.image_url,
    status = EXCLUDED.status,
    updated_by = EXCLUDED.updated_by;
INSERT INTO products (id, code, name, category_id, cost, price, price_max, highlights, tags, image_url, status, visible_to_client, qty_on_hand, track_stock, updated_by)
VALUES ('sw2-6', 'Reloja15', 'Smart Watch 2 + 6 Pulseiras', 'smartwatches', 58, 149.9, 169.9, '["Kit 2 rel\u00f3gios", "6 pulseiras", "Presente completo"]', '["kit", "intermediario"]', '', 'inactive', true, 0, true, 'seed-script')
ON CONFLICT (id) DO UPDATE SET
    code = EXCLUDED.code,
    name = EXCLUDED.name,
    category_id = EXCLUDED.category_id,
    cost = EXCLUDED.cost,
    price = EXCLUDED.price,
    price_max = EXCLUDED.price_max,
    highlights = EXCLUDED.highlights,
    tags = EXCLUDED.tags,
    image_url = EXCLUDED.image_url,
    status = EXCLUDED.status,
    updated_by = EXCLUDED.updated_by;
INSERT INTO products (id, code, name, category_id, cost, price, price_max, highlights, tags, image_url, status, visible_to_client, qty_on_hand, track_stock, updated_by)
VALUES ('w29s', 'Reloja17-2', 'Smartwatch W29s Series 9', 'smartwatches', 77, 189.9, 229.9, '["ChatGPT integrado", "Chamadas", "S\u00e9rie 9"]', '["intermediario"]', '', 'inactive', true, 0, true, 'seed-script')
ON CONFLICT (id) DO UPDATE SET
    code = EXCLUDED.code,
    name = EXCLUDED.name,
    category_id = EXCLUDED.category_id,
    cost = EXCLUDED.cost,
    price = EXCLUDED.price,
    price_max = EXCLUDED.price_max,
    highlights = EXCLUDED.highlights,
    tags = EXCLUDED.tags,
    image_url = EXCLUDED.image_url,
    status = EXCLUDED.status,
    updated_by = EXCLUDED.updated_by;
INSERT INTO products (id, code, name, category_id, cost, price, price_max, highlights, tags, image_url, status, visible_to_client, qty_on_hand, track_stock, updated_by)
VALUES ('treinoip68', 'Reloja6-1', 'Smartwatch Treino IP68', 'smartwatches', 79.99, 199.9, 219.9, '["Esportivo", "Resist\u00eancia IP68", "Para treino"]', '["intermediario", "esportivo"]', '', 'inactive', true, 0, true, 'seed-script')
ON CONFLICT (id) DO UPDATE SET
    code = EXCLUDED.code,
    name = EXCLUDED.name,
    category_id = EXCLUDED.category_id,
    cost = EXCLUDED.cost,
    price = EXCLUDED.price,
    price_max = EXCLUDED.price_max,
    highlights = EXCLUDED.highlights,
    tags = EXCLUDED.tags,
    image_url = EXCLUDED.image_url,
    status = EXCLUDED.status,
    updated_by = EXCLUDED.updated_by;
INSERT INTO products (id, code, name, category_id, cost, price, price_max, highlights, tags, image_url, status, visible_to_client, qty_on_hand, track_stock, updated_by)
VALUES ('s11pro', 'Reloja17-1', 'Smartwatch S11 Pro Série 11', 'smartwatches', 88, 219.9, 229.9, '["47mm", "GPS", "NFC", "ChatGPT"]', '["premium"]', '', 'inactive', true, 0, true, 'seed-script')
ON CONFLICT (id) DO UPDATE SET
    code = EXCLUDED.code,
    name = EXCLUDED.name,
    category_id = EXCLUDED.category_id,
    cost = EXCLUDED.cost,
    price = EXCLUDED.price,
    price_max = EXCLUDED.price_max,
    highlights = EXCLUDED.highlights,
    tags = EXCLUDED.tags,
    image_url = EXCLUDED.image_url,
    status = EXCLUDED.status,
    updated_by = EXCLUDED.updated_by;
INSERT INTO products (id, code, name, category_id, cost, price, price_max, highlights, tags, image_url, status, visible_to_client, qty_on_hand, track_stock, updated_by)
VALUES ('imeson', 'IMS-757A', 'Relógio Imeson IMS-757A', 'smartwatches', 136, 299.9, 349.9, '["7-9 dias de bateria", "3ATM \u00e0 prova d''\u00e1gua", "Chamada"]', '["premium", "topo-de-linha"]', '', 'active', true, 0, true, 'seed-script')
ON CONFLICT (id) DO UPDATE SET
    code = EXCLUDED.code,
    name = EXCLUDED.name,
    category_id = EXCLUDED.category_id,
    cost = EXCLUDED.cost,
    price = EXCLUDED.price,
    price_max = EXCLUDED.price_max,
    highlights = EXCLUDED.highlights,
    tags = EXCLUDED.tags,
    image_url = EXCLUDED.image_url,
    status = EXCLUDED.status,
    updated_by = EXCLUDED.updated_by;
INSERT INTO products (id, code, name, category_id, cost, price, price_max, highlights, tags, image_url, status, visible_to_client, qty_on_hand, track_stock, updated_by)
VALUES ('pro5', 'K33 A-607-P', 'Pro5 Fone Bluetooth TWS 5.4', 'fones', 13.8, 39.9, NULL, '["Premium sem fio", "Estilo Air", "Bluetooth 5.4"]', '["entrada", "tws"]', '', 'inactive', true, 0, true, 'seed-script')
ON CONFLICT (id) DO UPDATE SET
    code = EXCLUDED.code,
    name = EXCLUDED.name,
    category_id = EXCLUDED.category_id,
    cost = EXCLUDED.cost,
    price = EXCLUDED.price,
    price_max = EXCLUDED.price_max,
    highlights = EXCLUDED.highlights,
    tags = EXCLUDED.tags,
    image_url = EXCLUDED.image_url,
    status = EXCLUDED.status,
    updated_by = EXCLUDED.updated_by;
INSERT INTO products (id, code, name, category_id, cost, price, price_max, highlights, tags, image_url, status, visible_to_client, qty_on_hand, track_stock, updated_by)
VALUES ('m19', 'K39 Fone Bt M19', 'Fone M19 com Visor Digital LED', 'fones', 14.5, 39.9, NULL, '["Visor de bateria na case", "Android/iOS", "Compra por impulso"]', '["entrada", "mais-vendido", "visor-led"]', 'images/m19.jpg', 'active', true, 0, true, 'seed-script')
ON CONFLICT (id) DO UPDATE SET
    code = EXCLUDED.code,
    name = EXCLUDED.name,
    category_id = EXCLUDED.category_id,
    cost = EXCLUDED.cost,
    price = EXCLUDED.price,
    price_max = EXCLUDED.price_max,
    highlights = EXCLUDED.highlights,
    tags = EXCLUDED.tags,
    image_url = EXCLUDED.image_url,
    status = EXCLUDED.status,
    updated_by = EXCLUDED.updated_by;
INSERT INTO products (id, code, name, category_id, cost, price, price_max, highlights, tags, image_url, status, visible_to_client, qty_on_hand, track_stock, updated_by)
VALUES ('agoldv54', 'K13 FN-BJ3', 'Fone AGOLD V5.4 Longa Duração', 'fones', 25.8, 79.9, 89.9, '["Marca AGOLD", "Bateria longa", "Bluetooth V5.4"]', '["intermediario", "tws"]', '', 'inactive', true, 0, true, 'seed-script')
ON CONFLICT (id) DO UPDATE SET
    code = EXCLUDED.code,
    name = EXCLUDED.name,
    category_id = EXCLUDED.category_id,
    cost = EXCLUDED.cost,
    price = EXCLUDED.price,
    price_max = EXCLUDED.price_max,
    highlights = EXCLUDED.highlights,
    tags = EXCLUDED.tags,
    image_url = EXCLUDED.image_url,
    status = EXCLUDED.status,
    updated_by = EXCLUDED.updated_by;
INSERT INTO products (id, code, name, category_id, cost, price, price_max, highlights, tags, image_url, status, visible_to_client, qty_on_hand, track_stock, updated_by)
VALUES ('onex', 'K117 FON-2321', 'Fone ONEX Bluetooth 5.4', 'fones', 28.5, 79.9, 89.9, '["Conex\u00e3o est\u00e1vel", "V5.4", "Bom custo-benef\u00edcio"]', '["intermediario", "tws"]', '', 'inactive', true, 0, true, 'seed-script')
ON CONFLICT (id) DO UPDATE SET
    code = EXCLUDED.code,
    name = EXCLUDED.name,
    category_id = EXCLUDED.category_id,
    cost = EXCLUDED.cost,
    price = EXCLUDED.price,
    price_max = EXCLUDED.price_max,
    highlights = EXCLUDED.highlights,
    tags = EXCLUDED.tags,
    image_url = EXCLUDED.image_url,
    status = EXCLUDED.status,
    updated_by = EXCLUDED.updated_by;
INSERT INTO products (id, code, name, category_id, cost, price, price_max, highlights, tags, image_url, status, visible_to_client, qty_on_hand, track_stock, updated_by)
VALUES ('agoldpro8', 'K70 FN-B58', 'Fone AGOLD Pro8 Nova V6.0', 'fones', 28.99, 79.9, 89.9, '["Bluetooth V6.0", "Lan\u00e7amento", "Marca AGOLD"]', '["intermediario", "tws"]', '', 'inactive', true, 0, true, 'seed-script')
ON CONFLICT (id) DO UPDATE SET
    code = EXCLUDED.code,
    name = EXCLUDED.name,
    category_id = EXCLUDED.category_id,
    cost = EXCLUDED.cost,
    price = EXCLUDED.price,
    price_max = EXCLUDED.price_max,
    highlights = EXCLUDED.highlights,
    tags = EXCLUDED.tags,
    image_url = EXCLUDED.image_url,
    status = EXCLUDED.status,
    updated_by = EXCLUDED.updated_by;
INSERT INTO products (id, code, name, category_id, cost, price, price_max, highlights, tags, image_url, status, visible_to_client, qty_on_hand, track_stock, updated_by)
VALUES ('imenso-v6', 'K103 IMS-818-A', 'IMENSO Fone V6.0 TWS In-Ear', 'fones', 32, 79.9, 89.9, '["In-Ear", "Longa dura\u00e7\u00e3o", "Bluetooth V6.0"]', '["intermediario", "tws"]', '', 'inactive', true, 0, true, 'seed-script')
ON CONFLICT (id) DO UPDATE SET
    code = EXCLUDED.code,
    name = EXCLUDED.name,
    category_id = EXCLUDED.category_id,
    cost = EXCLUDED.cost,
    price = EXCLUDED.price,
    price_max = EXCLUDED.price_max,
    highlights = EXCLUDED.highlights,
    tags = EXCLUDED.tags,
    image_url = EXCLUDED.image_url,
    status = EXCLUDED.status,
    updated_by = EXCLUDED.updated_by;
INSERT INTO products (id, code, name, category_id, cost, price, price_max, highlights, tags, image_url, status, visible_to_client, qty_on_hand, track_stock, updated_by)
VALUES ('imenso-52', 'K06 IMS-821', 'IMENSO Bluetooth 5.2 Original', 'fones', 65, 119.9, 139.9, '["Qualidade superior", "IMENSO original", "Som limpo"]', '["premium", "tws"]', 'images/imenso-52.jpg', 'active', true, 0, true, 'seed-script')
ON CONFLICT (id) DO UPDATE SET
    code = EXCLUDED.code,
    name = EXCLUDED.name,
    category_id = EXCLUDED.category_id,
    cost = EXCLUDED.cost,
    price = EXCLUDED.price,
    price_max = EXCLUDED.price_max,
    highlights = EXCLUDED.highlights,
    tags = EXCLUDED.tags,
    image_url = EXCLUDED.image_url,
    status = EXCLUDED.status,
    updated_by = EXCLUDED.updated_by;
INSERT INTO products (id, code, name, category_id, cost, price, price_max, highlights, tags, image_url, status, visible_to_client, qty_on_hand, track_stock, updated_by)
VALUES ('ganchobt53', 'K118 J-85 Pro', 'Fone Gancho Auricular BT 5.3', 'fones', 23, 59.9, 79.9, '["Fixa\u00e7\u00e3o segura", "Estojo carregamento", "Para esporte"]', '["esportivo", "intermediario"]', '', 'inactive', true, 0, true, 'seed-script')
ON CONFLICT (id) DO UPDATE SET
    code = EXCLUDED.code,
    name = EXCLUDED.name,
    category_id = EXCLUDED.category_id,
    cost = EXCLUDED.cost,
    price = EXCLUDED.price,
    price_max = EXCLUDED.price_max,
    highlights = EXCLUDED.highlights,
    tags = EXCLUDED.tags,
    image_url = EXCLUDED.image_url,
    status = EXCLUDED.status,
    updated_by = EXCLUDED.updated_by;
INSERT INTO products (id, code, name, category_id, cost, price, price_max, highlights, tags, image_url, status, visible_to_client, qty_on_hand, track_stock, updated_by)
VALUES ('st15', 'K113 ST-15', 'Fone Esportivo ST-15', 'fones', 36.8, 99.9, NULL, '["60h de m\u00fasica", "Hi-Fi", "Bluetooth 5.3"]', '["esportivo", "intermediario"]', 'images/st15.jpg', 'active', true, 0, true, 'seed-script')
ON CONFLICT (id) DO UPDATE SET
    code = EXCLUDED.code,
    name = EXCLUDED.name,
    category_id = EXCLUDED.category_id,
    cost = EXCLUDED.cost,
    price = EXCLUDED.price,
    price_max = EXCLUDED.price_max,
    highlights = EXCLUDED.highlights,
    tags = EXCLUDED.tags,
    image_url = EXCLUDED.image_url,
    status = EXCLUDED.status,
    updated_by = EXCLUDED.updated_by;
INSERT INTO products (id, code, name, category_id, cost, price, price_max, highlights, tags, image_url, status, visible_to_client, qty_on_hand, track_stock, updated_by)
VALUES ('hsgamerp2', 'J140 BM216', 'Headset Gamer P2', 'fones', 36.5, 99.9, NULL, '["PS4/PC/Xbox", "Conex\u00e3o P2", "Microfone"]', '["gamer", "headset"]', '', 'inactive', true, 0, true, 'seed-script')
ON CONFLICT (id) DO UPDATE SET
    code = EXCLUDED.code,
    name = EXCLUDED.name,
    category_id = EXCLUDED.category_id,
    cost = EXCLUDED.cost,
    price = EXCLUDED.price,
    price_max = EXCLUDED.price_max,
    highlights = EXCLUDED.highlights,
    tags = EXCLUDED.tags,
    image_url = EXCLUDED.image_url,
    status = EXCLUDED.status,
    updated_by = EXCLUDED.updated_by;
INSERT INTO products (id, code, name, category_id, cost, price, price_max, highlights, tags, image_url, status, visible_to_client, qty_on_hand, track_stock, updated_by)
VALUES ('hslehmoxusb', 'Lehmox', 'Headset Gamer USB Lehmox', 'fones', 43, 119.9, 159, '["USB", "Microfone", "Marca Lehmox"]', '["gamer", "headset", "intermediario"]', '', 'inactive', true, 0, true, 'seed-script')
ON CONFLICT (id) DO UPDATE SET
    code = EXCLUDED.code,
    name = EXCLUDED.name,
    category_id = EXCLUDED.category_id,
    cost = EXCLUDED.cost,
    price = EXCLUDED.price,
    price_max = EXCLUDED.price_max,
    highlights = EXCLUDED.highlights,
    tags = EXCLUDED.tags,
    image_url = EXCLUDED.image_url,
    status = EXCLUDED.status,
    updated_by = EXCLUDED.updated_by;
INSERT INTO products (id, code, name, category_id, cost, price, price_max, highlights, tags, image_url, status, visible_to_client, qty_on_hand, track_stock, updated_by)
VALUES ('hssemfio', 'J141 LEF-1031A', 'Headset Gamer Sem Fio BT', 'fones', 55, 139.9, 159, '["Bluetooth", "Microfone", "Sem fio"]', '["gamer", "headset", "premium"]', '', 'inactive', true, 0, true, 'seed-script')
ON CONFLICT (id) DO UPDATE SET
    code = EXCLUDED.code,
    name = EXCLUDED.name,
    category_id = EXCLUDED.category_id,
    cost = EXCLUDED.cost,
    price = EXCLUDED.price,
    price_max = EXCLUDED.price_max,
    highlights = EXCLUDED.highlights,
    tags = EXCLUDED.tags,
    image_url = EXCLUDED.image_url,
    status = EXCLUDED.status,
    updated_by = EXCLUDED.updated_by;
INSERT INTO products (id, code, name, category_id, cost, price, price_max, highlights, tags, image_url, status, visible_to_client, qty_on_hand, track_stock, updated_by)
VALUES ('hslehmoxrgb', 'J81 LEY-2304', 'Headset Lehmox LED RGB', 'fones', 53, 139.9, NULL, '["LED RGB", "Microfone", "Design gamer"]', '["gamer", "headset", "rgb"]', '', 'inactive', true, 0, true, 'seed-script')
ON CONFLICT (id) DO UPDATE SET
    code = EXCLUDED.code,
    name = EXCLUDED.name,
    category_id = EXCLUDED.category_id,
    cost = EXCLUDED.cost,
    price = EXCLUDED.price,
    price_max = EXCLUDED.price_max,
    highlights = EXCLUDED.highlights,
    tags = EXCLUDED.tags,
    image_url = EXCLUDED.image_url,
    status = EXCLUDED.status,
    updated_by = EXCLUDED.updated_by;
INSERT INTO products (id, code, name, category_id, cost, price, price_max, highlights, tags, image_url, status, visible_to_client, qty_on_hand, track_stock, updated_by)
VALUES ('hsrgbmulti', 'J201 ON-FN636', 'Headset LED RGB Multiplataforma', 'fones', 59.99, 149.9, 159, '["PC/Celular/Xbox/PS4/PS5", "RGB", "Microfone"]', '["gamer", "headset", "rgb", "premium"]', '', 'inactive', true, 0, true, 'seed-script')
ON CONFLICT (id) DO UPDATE SET
    code = EXCLUDED.code,
    name = EXCLUDED.name,
    category_id = EXCLUDED.category_id,
    cost = EXCLUDED.cost,
    price = EXCLUDED.price,
    price_max = EXCLUDED.price_max,
    highlights = EXCLUDED.highlights,
    tags = EXCLUDED.tags,
    image_url = EXCLUDED.image_url,
    status = EXCLUDED.status,
    updated_by = EXCLUDED.updated_by;
INSERT INTO products (id, code, name, category_id, cost, price, price_max, highlights, tags, image_url, status, visible_to_client, qty_on_hand, track_stock, updated_by)
VALUES ('fonep2mic', 'J182 LE-0202', 'Fone P2 com Microfone', 'fones', 6.8, 19.9, NULL, '["Com fio", "B\u00e1sico", "Microfone"]', '["entrada", "com-fio"]', '', 'inactive', true, 0, true, 'seed-script')
ON CONFLICT (id) DO UPDATE SET
    code = EXCLUDED.code,
    name = EXCLUDED.name,
    category_id = EXCLUDED.category_id,
    cost = EXCLUDED.cost,
    price = EXCLUDED.price,
    price_max = EXCLUDED.price_max,
    highlights = EXCLUDED.highlights,
    tags = EXCLUDED.tags,
    image_url = EXCLUDED.image_url,
    status = EXCLUDED.status,
    updated_by = EXCLUDED.updated_by;
INSERT INTO products (id, code, name, category_id, cost, price, price_max, highlights, tags, image_url, status, visible_to_client, qty_on_hand, track_stock, updated_by)
VALUES ('hsmoto-y10', 'R256 Y10', 'Headset Capacete Moto Y10', 'fones', 35, 99.9, NULL, '["Bluetooth 5.3", "IPX6", "Redu\u00e7\u00e3o de ru\u00eddo"]', '["moto", "headset", "intermediario"]', '', 'inactive', true, 0, true, 'seed-script')
ON CONFLICT (id) DO UPDATE SET
    code = EXCLUDED.code,
    name = EXCLUDED.name,
    category_id = EXCLUDED.category_id,
    cost = EXCLUDED.cost,
    price = EXCLUDED.price,
    price_max = EXCLUDED.price_max,
    highlights = EXCLUDED.highlights,
    tags = EXCLUDED.tags,
    image_url = EXCLUDED.image_url,
    status = EXCLUDED.status,
    updated_by = EXCLUDED.updated_by;
INSERT INTO products (id, code, name, category_id, cost, price, price_max, highlights, tags, image_url, status, visible_to_client, qty_on_hand, track_stock, updated_by)
VALUES ('mouse-kapbom', 'KAPBOM KA-611', 'Mouse Sem Fio KAPBOM KA-611 2.4G', 'informatica', 11.8, 39.9, NULL, '["Gamer", "Ergon\u00f4mico", "USB 2.4G"]', '["entrada", "mouse", "mais-vendido"]', 'images/mouse-kapbom.jpg', 'active', true, 0, true, 'seed-script')
ON CONFLICT (id) DO UPDATE SET
    code = EXCLUDED.code,
    name = EXCLUDED.name,
    category_id = EXCLUDED.category_id,
    cost = EXCLUDED.cost,
    price = EXCLUDED.price,
    price_max = EXCLUDED.price_max,
    highlights = EXCLUDED.highlights,
    tags = EXCLUDED.tags,
    image_url = EXCLUDED.image_url,
    status = EXCLUDED.status,
    updated_by = EXCLUDED.updated_by;
INSERT INTO products (id, code, name, category_id, cost, price, price_max, highlights, tags, image_url, status, visible_to_client, qty_on_hand, track_stock, updated_by)
VALUES ('mouse-t03', 'T03 VT-05', 'Mouse BT 5.0 + USB 2.4G', 'informatica', 11.8, 39.9, NULL, '["Dupla conectividade", "Bluetooth + 2.4G", "Ergon\u00f4mico"]', '["entrada", "mouse"]', '', 'inactive', true, 0, true, 'seed-script')
ON CONFLICT (id) DO UPDATE SET
    code = EXCLUDED.code,
    name = EXCLUDED.name,
    category_id = EXCLUDED.category_id,
    cost = EXCLUDED.cost,
    price = EXCLUDED.price,
    price_max = EXCLUDED.price_max,
    highlights = EXCLUDED.highlights,
    tags = EXCLUDED.tags,
    image_url = EXCLUDED.image_url,
    status = EXCLUDED.status,
    updated_by = EXCLUDED.updated_by;
INSERT INTO products (id, code, name, category_id, cost, price, price_max, highlights, tags, image_url, status, visible_to_client, qty_on_hand, track_stock, updated_by)
VALUES ('mouse-t24', 'T24', 'Mouse Bluetooth 2.4 Wireless', 'informatica', 11.65, 39.9, NULL, '["Alcance 10m", "Pre\u00e7o varia por lote", "Sem fio"]', '["entrada", "mouse"]', '', 'inactive', true, 0, true, 'seed-script')
ON CONFLICT (id) DO UPDATE SET
    code = EXCLUDED.code,
    name = EXCLUDED.name,
    category_id = EXCLUDED.category_id,
    cost = EXCLUDED.cost,
    price = EXCLUDED.price,
    price_max = EXCLUDED.price_max,
    highlights = EXCLUDED.highlights,
    tags = EXCLUDED.tags,
    image_url = EXCLUDED.image_url,
    status = EXCLUDED.status,
    updated_by = EXCLUDED.updated_by;
INSERT INTO products (id, code, name, category_id, cost, price, price_max, highlights, tags, image_url, status, visible_to_client, qty_on_hand, track_stock, updated_by)
VALUES ('tec-rgb-bmax', 'T18 BM-T10', 'Teclado Semi-mecânico RGB B-Max', 'informatica', 32, 89.9, 120, '["RGB", "Estilo gamer", "Semi-mec\u00e2nico"]', '["intermediario", "teclado", "rgb"]', 'images/tec-rgb-bmax.jpg', 'active', true, 0, true, 'seed-script')
ON CONFLICT (id) DO UPDATE SET
    code = EXCLUDED.code,
    name = EXCLUDED.name,
    category_id = EXCLUDED.category_id,
    cost = EXCLUDED.cost,
    price = EXCLUDED.price,
    price_max = EXCLUDED.price_max,
    highlights = EXCLUDED.highlights,
    tags = EXCLUDED.tags,
    image_url = EXCLUDED.image_url,
    status = EXCLUDED.status,
    updated_by = EXCLUDED.updated_by;
INSERT INTO products (id, code, name, category_id, cost, price, price_max, highlights, tags, image_url, status, visible_to_client, qty_on_hand, track_stock, updated_by)
VALUES ('tec-android', 'L174 KA-689', 'Teclado Android/PC BT Sem Fio', 'informatica', 33, 99.9, NULL, '["Wireless", "Android + PC", "Compacto"]', '["intermediario", "teclado"]', '', 'inactive', true, 0, true, 'seed-script')
ON CONFLICT (id) DO UPDATE SET
    code = EXCLUDED.code,
    name = EXCLUDED.name,
    category_id = EXCLUDED.category_id,
    cost = EXCLUDED.cost,
    price = EXCLUDED.price,
    price_max = EXCLUDED.price_max,
    highlights = EXCLUDED.highlights,
    tags = EXCLUDED.tags,
    image_url = EXCLUDED.image_url,
    status = EXCLUDED.status,
    updated_by = EXCLUDED.updated_by;
INSERT INTO products (id, code, name, category_id, cost, price, price_max, highlights, tags, image_url, status, visible_to_client, qty_on_hand, track_stock, updated_by)
VALUES ('tec-touchpad', 'T112 TCD-05', 'Teclado BT Touchpad Slim', 'informatica', 33, 99.9, NULL, '["Touchpad integrado", "Slim", "Bluetooth"]', '["intermediario", "teclado"]', '', 'inactive', true, 0, true, 'seed-script')
ON CONFLICT (id) DO UPDATE SET
    code = EXCLUDED.code,
    name = EXCLUDED.name,
    category_id = EXCLUDED.category_id,
    cost = EXCLUDED.cost,
    price = EXCLUDED.price,
    price_max = EXCLUDED.price_max,
    highlights = EXCLUDED.highlights,
    tags = EXCLUDED.tags,
    image_url = EXCLUDED.image_url,
    status = EXCLUDED.status,
    updated_by = EXCLUDED.updated_by;
INSERT INTO products (id, code, name, category_id, cost, price, price_max, highlights, tags, image_url, status, visible_to_client, qty_on_hand, track_stock, updated_by)
VALUES ('tec-fio-sup', 'T27 KP-TE132', 'Teclado Com Fio + Suporte Smartphone', 'informatica', 36, 109.9, NULL, '["Silencioso", "Suporte celular", "Com fio"]', '["intermediario", "teclado"]', '', 'inactive', true, 0, true, 'seed-script')
ON CONFLICT (id) DO UPDATE SET
    code = EXCLUDED.code,
    name = EXCLUDED.name,
    category_id = EXCLUDED.category_id,
    cost = EXCLUDED.cost,
    price = EXCLUDED.price,
    price_max = EXCLUDED.price_max,
    highlights = EXCLUDED.highlights,
    tags = EXCLUDED.tags,
    image_url = EXCLUDED.image_url,
    status = EXCLUDED.status,
    updated_by = EXCLUDED.updated_by;
INSERT INTO products (id, code, name, category_id, cost, price, price_max, highlights, tags, image_url, status, visible_to_client, qty_on_hand, track_stock, updated_by)
VALUES ('tec-mec-rgb', 'T40 LEY-2092', 'Teclado Mecânico RGB Original', 'informatica', 83, 199.9, 249, '["Switch RGB", "PC/PS4/Xbox", "Mec\u00e2nico original"]', '["premium", "teclado", "rgb", "gamer"]', '', 'inactive', true, 0, true, 'seed-script')
ON CONFLICT (id) DO UPDATE SET
    code = EXCLUDED.code,
    name = EXCLUDED.name,
    category_id = EXCLUDED.category_id,
    cost = EXCLUDED.cost,
    price = EXCLUDED.price,
    price_max = EXCLUDED.price_max,
    highlights = EXCLUDED.highlights,
    tags = EXCLUDED.tags,
    image_url = EXCLUDED.image_url,
    status = EXCLUDED.status,
    updated_by = EXCLUDED.updated_by;
INSERT INTO products (id, code, name, category_id, cost, price, price_max, highlights, tags, image_url, status, visible_to_client, qty_on_hand, track_stock, updated_by)
VALUES ('combo-tm', 'Ley', 'Combo Teclado + Mouse Sem Fio USB', 'informatica', 45, 99.9, NULL, '["Combo completo", "2.4GHz", "Pronto pra uso"]', '["kit", "intermediario", "combo"]', '', 'inactive', true, 0, true, 'seed-script')
ON CONFLICT (id) DO UPDATE SET
    code = EXCLUDED.code,
    name = EXCLUDED.name,
    category_id = EXCLUDED.category_id,
    cost = EXCLUDED.cost,
    price = EXCLUDED.price,
    price_max = EXCLUDED.price_max,
    highlights = EXCLUDED.highlights,
    tags = EXCLUDED.tags,
    image_url = EXCLUDED.image_url,
    status = EXCLUDED.status,
    updated_by = EXCLUDED.updated_by;
INSERT INTO products (id, code, name, category_id, cost, price, price_max, highlights, tags, image_url, status, visible_to_client, qty_on_hand, track_stock, updated_by)
VALUES ('tablet-101', 'MM-PB101', 'Tablet 10.1" 5G + Teclado + Mouse', 'informatica', 599.99, 899, NULL, '["16GB RAM", "512GB", "Android", "50MP", "Kit completo"]', '["premium", "tablet", "kit"]', 'images/tablet-101.png', 'active', true, 0, true, 'seed-script')
ON CONFLICT (id) DO UPDATE SET
    code = EXCLUDED.code,
    name = EXCLUDED.name,
    category_id = EXCLUDED.category_id,
    cost = EXCLUDED.cost,
    price = EXCLUDED.price,
    price_max = EXCLUDED.price_max,
    highlights = EXCLUDED.highlights,
    tags = EXCLUDED.tags,
    image_url = EXCLUDED.image_url,
    status = EXCLUDED.status,
    updated_by = EXCLUDED.updated_by;
INSERT INTO products (id, code, name, category_id, cost, price, price_max, highlights, tags, image_url, status, visible_to_client, qty_on_hand, track_stock, updated_by)
VALUES ('hub-usb3-4p', 'C60 AJ-9037', 'Hub USB 3.0 4 Portas 5 Gbps', 'informatica', 6.8, 24.9, 34.9, '["Super r\u00e1pido", "4 portas", "USB 3.0"]', '["entrada", "hub", "mais-vendido"]', '', 'inactive', true, 0, true, 'seed-script')
ON CONFLICT (id) DO UPDATE SET
    code = EXCLUDED.code,
    name = EXCLUDED.name,
    category_id = EXCLUDED.category_id,
    cost = EXCLUDED.cost,
    price = EXCLUDED.price,
    price_max = EXCLUDED.price_max,
    highlights = EXCLUDED.highlights,
    tags = EXCLUDED.tags,
    image_url = EXCLUDED.image_url,
    status = EXCLUDED.status,
    updated_by = EXCLUDED.updated_by;
INSERT INTO products (id, code, name, category_id, cost, price, price_max, highlights, tags, image_url, status, visible_to_client, qty_on_hand, track_stock, updated_by)
VALUES ('hub-usb7-2p', 'R233 BM-8638', 'Hub USB 7 Portas 2.0', 'informatica', 10.3, 29.9, NULL, '["Para TV", "Pendrive", "Perif\u00e9ricos"]', '["entrada", "hub"]', '', 'inactive', true, 0, true, 'seed-script')
ON CONFLICT (id) DO UPDATE SET
    code = EXCLUDED.code,
    name = EXCLUDED.name,
    category_id = EXCLUDED.category_id,
    cost = EXCLUDED.cost,
    price = EXCLUDED.price,
    price_max = EXCLUDED.price_max,
    highlights = EXCLUDED.highlights,
    tags = EXCLUDED.tags,
    image_url = EXCLUDED.image_url,
    status = EXCLUDED.status,
    updated_by = EXCLUDED.updated_by;
INSERT INTO products (id, code, name, category_id, cost, price, price_max, highlights, tags, image_url, status, visible_to_client, qty_on_hand, track_stock, updated_by)
VALUES ('tvbox-tomate', 'MCD-121', 'Smart TV Box Tomate Android 4K', 'eletronicos', 50, 129.9, NULL, '["2GB+16GB", "Wi-Fi", "Android 4K"]', '["tv-box", "sob-consulta"]', '', 'inactive', true, 0, true, 'seed-script')
ON CONFLICT (id) DO UPDATE SET
    code = EXCLUDED.code,
    name = EXCLUDED.name,
    category_id = EXCLUDED.category_id,
    cost = EXCLUDED.cost,
    price = EXCLUDED.price,
    price_max = EXCLUDED.price_max,
    highlights = EXCLUDED.highlights,
    tags = EXCLUDED.tags,
    image_url = EXCLUDED.image_url,
    status = EXCLUDED.status,
    updated_by = EXCLUDED.updated_by;
INSERT INTO products (id, code, name, category_id, cost, price, price_max, highlights, tags, image_url, status, visible_to_client, qty_on_hand, track_stock, updated_by)
VALUES ('tvbox-tx9', 'TX9 TVBOX', 'TV Box TX9 Android 13.0 4K', 'eletronicos', 55, 139.9, NULL, '["2GB+16GB", "R\u00e1pido", "Android 13"]', '["tv-box", "sob-consulta"]', '', 'inactive', true, 0, true, 'seed-script')
ON CONFLICT (id) DO UPDATE SET
    code = EXCLUDED.code,
    name = EXCLUDED.name,
    category_id = EXCLUDED.category_id,
    cost = EXCLUDED.cost,
    price = EXCLUDED.price,
    price_max = EXCLUDED.price_max,
    highlights = EXCLUDED.highlights,
    tags = EXCLUDED.tags,
    image_url = EXCLUDED.image_url,
    status = EXCLUDED.status,
    updated_by = EXCLUDED.updated_by;
INSERT INTO products (id, code, name, category_id, cost, price, price_max, highlights, tags, image_url, status, visible_to_client, qty_on_hand, track_stock, updated_by)
VALUES ('controle-tvbox', 'X49 / X58', 'Controle Remoto TV Box Universal', 'eletronicos', 4.05, 19.9, NULL, '["Compat\u00edvel maioria TV Box", "Universal", "Android"]', '["entrada", "controle"]', '', 'inactive', true, 0, true, 'seed-script')
ON CONFLICT (id) DO UPDATE SET
    code = EXCLUDED.code,
    name = EXCLUDED.name,
    category_id = EXCLUDED.category_id,
    cost = EXCLUDED.cost,
    price = EXCLUDED.price,
    price_max = EXCLUDED.price_max,
    highlights = EXCLUDED.highlights,
    tags = EXCLUDED.tags,
    image_url = EXCLUDED.image_url,
    status = EXCLUDED.status,
    updated_by = EXCLUDED.updated_by;
INSERT INTO products (id, code, name, category_id, cost, price, price_max, highlights, tags, image_url, status, visible_to_client, qty_on_hand, track_stock, updated_by)
VALUES ('proj-astro', 'L142 NY-32', 'Projetor Astronauta Galáxia', 'eletronicos', 43, 89.9, NULL, '["Estrelas/gal\u00e1xia", "Quarto/infantil", "Presente"]', '["intermediario", "projetor", "decor"]', 'images/proj-astro.jpg', 'active', true, 0, true, 'seed-script')
ON CONFLICT (id) DO UPDATE SET
    code = EXCLUDED.code,
    name = EXCLUDED.name,
    category_id = EXCLUDED.category_id,
    cost = EXCLUDED.cost,
    price = EXCLUDED.price,
    price_max = EXCLUDED.price_max,
    highlights = EXCLUDED.highlights,
    tags = EXCLUDED.tags,
    image_url = EXCLUDED.image_url,
    status = EXCLUDED.status,
    updated_by = EXCLUDED.updated_by;
INSERT INTO products (id, code, name, category_id, cost, price, price_max, highlights, tags, image_url, status, visible_to_client, qty_on_hand, track_stock, updated_by)
VALUES ('proj-astro-eco', 'L144 NY-40', 'Projetor Astronauta (Econômico)', 'eletronicos', 29.99, 79.9, 99.9, '["Vers\u00e3o compacta", "Gal\u00e1xia", "Custo-benef\u00edcio"]', '["entrada", "projetor", "decor"]', '', 'inactive', true, 0, true, 'seed-script')
ON CONFLICT (id) DO UPDATE SET
    code = EXCLUDED.code,
    name = EXCLUDED.name,
    category_id = EXCLUDED.category_id,
    cost = EXCLUDED.cost,
    price = EXCLUDED.price,
    price_max = EXCLUDED.price_max,
    highlights = EXCLUDED.highlights,
    tags = EXCLUDED.tags,
    image_url = EXCLUDED.image_url,
    status = EXCLUDED.status,
    updated_by = EXCLUDED.updated_by;
INSERT INTO products (id, code, name, category_id, cost, price, price_max, highlights, tags, image_url, status, visible_to_client, qty_on_hand, track_stock, updated_by)
VALUES ('proj-magic', 'HY300', 'Projetor Magic Smart Wifi 4K', 'eletronicos', 175, 399.9, 499, '["Android", "Wi-Fi", "BT", "Estilo Magcubic"]', '["premium", "projetor"]', '', 'inactive', true, 0, true, 'seed-script')
ON CONFLICT (id) DO UPDATE SET
    code = EXCLUDED.code,
    name = EXCLUDED.name,
    category_id = EXCLUDED.category_id,
    cost = EXCLUDED.cost,
    price = EXCLUDED.price,
    price_max = EXCLUDED.price_max,
    highlights = EXCLUDED.highlights,
    tags = EXCLUDED.tags,
    image_url = EXCLUDED.image_url,
    status = EXCLUDED.status,
    updated_by = EXCLUDED.updated_by;
INSERT INTO products (id, code, name, category_id, cost, price, price_max, highlights, tags, image_url, status, visible_to_client, qty_on_hand, track_stock, updated_by)
VALUES ('proj-hy320', 'PGT-HY320', 'Projetor HY320 Full HD Nativo', 'eletronicos', 195, 449.9, NULL, '["Full HD", "4K suporte", "AGOLD"]', '["premium", "projetor"]', '', 'inactive', true, 0, true, 'seed-script')
ON CONFLICT (id) DO UPDATE SET
    code = EXCLUDED.code,
    name = EXCLUDED.name,
    category_id = EXCLUDED.category_id,
    cost = EXCLUDED.cost,
    price = EXCLUDED.price,
    price_max = EXCLUDED.price_max,
    highlights = EXCLUDED.highlights,
    tags = EXCLUDED.tags,
    image_url = EXCLUDED.image_url,
    status = EXCLUDED.status,
    updated_by = EXCLUDED.updated_by;
INSERT INTO products (id, code, name, category_id, cost, price, price_max, highlights, tags, image_url, status, visible_to_client, qty_on_hand, track_stock, updated_by)
VALUES ('proj-hy330', 'PGT-HY330', 'Projetor HY330 4K Ultra HD', 'eletronicos', 198, 469.9, NULL, '["At\u00e9 150\"", "AGOLD", "4K Ultra HD"]', '["premium", "projetor"]', '', 'inactive', true, 0, true, 'seed-script')
ON CONFLICT (id) DO UPDATE SET
    code = EXCLUDED.code,
    name = EXCLUDED.name,
    category_id = EXCLUDED.category_id,
    cost = EXCLUDED.cost,
    price = EXCLUDED.price,
    price_max = EXCLUDED.price_max,
    highlights = EXCLUDED.highlights,
    tags = EXCLUDED.tags,
    image_url = EXCLUDED.image_url,
    status = EXCLUDED.status,
    updated_by = EXCLUDED.updated_by;
INSERT INTO products (id, code, name, category_id, cost, price, price_max, highlights, tags, image_url, status, visible_to_client, qty_on_hand, track_stock, updated_by)
VALUES ('caixa-mini', 'Atacado 100un', 'Caixa Mini Colorida 5W', 'eletronicos', 11.8, 24.9, NULL, '["Compacta", "Brindes", "Venda r\u00e1pida"]', '["entrada", "caixa-som"]', 'images/caixa-mini.jpg', 'active', true, 0, true, 'seed-script')
ON CONFLICT (id) DO UPDATE SET
    code = EXCLUDED.code,
    name = EXCLUDED.name,
    category_id = EXCLUDED.category_id,
    cost = EXCLUDED.cost,
    price = EXCLUDED.price,
    price_max = EXCLUDED.price_max,
    highlights = EXCLUDED.highlights,
    tags = EXCLUDED.tags,
    image_url = EXCLUDED.image_url,
    status = EXCLUDED.status,
    updated_by = EXCLUDED.updated_by;
INSERT INTO products (id, code, name, category_id, cost, price, price_max, highlights, tags, image_url, status, visible_to_client, qty_on_hand, track_stock, updated_by)
VALUES ('caixa-karaoke', 'R25 KA-8195', 'Caixa Karaokê LED + 1 Microfone', 'eletronicos', 35, 99.9, NULL, '["LED", "Microfone", "Port\u00e1til"]', '["intermediario", "caixa-som", "karaoke"]', '', 'inactive', true, 0, true, 'seed-script')
ON CONFLICT (id) DO UPDATE SET
    code = EXCLUDED.code,
    name = EXCLUDED.name,
    category_id = EXCLUDED.category_id,
    cost = EXCLUDED.cost,
    price = EXCLUDED.price,
    price_max = EXCLUDED.price_max,
    highlights = EXCLUDED.highlights,
    tags = EXCLUDED.tags,
    image_url = EXCLUDED.image_url,
    status = EXCLUDED.status,
    updated_by = EXCLUDED.updated_by;
INSERT INTO products (id, code, name, category_id, cost, price, price_max, highlights, tags, image_url, status, visible_to_client, qty_on_hand, track_stock, updated_by)
VALUES ('caixa-100w', 'R71 EL-1132', 'Caixa 100W Bluetooth Portátil', 'eletronicos', 105, 219.9, NULL, '["Alta pot\u00eancia", "Festas/externo", "Bluetooth"]', '["premium", "caixa-som"]', '', 'inactive', true, 0, true, 'seed-script')
ON CONFLICT (id) DO UPDATE SET
    code = EXCLUDED.code,
    name = EXCLUDED.name,
    category_id = EXCLUDED.category_id,
    cost = EXCLUDED.cost,
    price = EXCLUDED.price,
    price_max = EXCLUDED.price_max,
    highlights = EXCLUDED.highlights,
    tags = EXCLUDED.tags,
    image_url = EXCLUDED.image_url,
    status = EXCLUDED.status,
    updated_by = EXCLUDED.updated_by;
INSERT INTO products (id, code, name, category_id, cost, price, price_max, highlights, tags, image_url, status, visible_to_client, qty_on_hand, track_stock, updated_by)
VALUES ('caixa-bass20', 'R32 JBL P PRO 7', 'Caixa Extra Bass 20W RGB', 'eletronicos', 118, 249.9, NULL, '["Estilo JBL", "Grave potente", "RGB"]', '["premium", "caixa-som", "rgb"]', 'images/caixa-bass20.jpg', 'active', true, 0, true, 'seed-script')
ON CONFLICT (id) DO UPDATE SET
    code = EXCLUDED.code,
    name = EXCLUDED.name,
    category_id = EXCLUDED.category_id,
    cost = EXCLUDED.cost,
    price = EXCLUDED.price,
    price_max = EXCLUDED.price_max,
    highlights = EXCLUDED.highlights,
    tags = EXCLUDED.tags,
    image_url = EXCLUDED.image_url,
    status = EXCLUDED.status,
    updated_by = EXCLUDED.updated_by;
INSERT INTO products (id, code, name, category_id, cost, price, price_max, highlights, tags, image_url, status, visible_to_client, qty_on_hand, track_stock, updated_by)
VALUES ('caixa-300w', 'R87 EL-1144', 'Caixa 300W + 2 Mics + FM + USB', 'eletronicos', 335, 799, 899, '["Alta pot\u00eancia", "2 mics sem fio", "FM + USB"]', '["premium", "caixa-som", "kit"]', '', 'inactive', true, 0, true, 'seed-script')
ON CONFLICT (id) DO UPDATE SET
    code = EXCLUDED.code,
    name = EXCLUDED.name,
    category_id = EXCLUDED.category_id,
    cost = EXCLUDED.cost,
    price = EXCLUDED.price,
    price_max = EXCLUDED.price_max,
    highlights = EXCLUDED.highlights,
    tags = EXCLUDED.tags,
    image_url = EXCLUDED.image_url,
    status = EXCLUDED.status,
    updated_by = EXCLUDED.updated_by;
INSERT INTO products (id, code, name, category_id, cost, price, price_max, highlights, tags, image_url, status, visible_to_client, qty_on_hand, track_stock, updated_by)
VALUES ('vent-mesa', 'S122 FS45', 'Mini Ventilador USB de Mesa', 'eletronicos', 11.5, 29.9, 39.9, '["3 velocidades", "USB", "Mesa"]', '["entrada", "ventilador"]', '', 'inactive', true, 0, true, 'seed-script')
ON CONFLICT (id) DO UPDATE SET
    code = EXCLUDED.code,
    name = EXCLUDED.name,
    category_id = EXCLUDED.category_id,
    cost = EXCLUDED.cost,
    price = EXCLUDED.price,
    price_max = EXCLUDED.price_max,
    highlights = EXCLUDED.highlights,
    tags = EXCLUDED.tags,
    image_url = EXCLUDED.image_url,
    status = EXCLUDED.status,
    updated_by = EXCLUDED.updated_by;
INSERT INTO products (id, code, name, category_id, cost, price, price_max, highlights, tags, image_url, status, visible_to_client, qty_on_hand, track_stock, updated_by)
VALUES ('vent-mao', 'S213 VTL-363', 'Mini Ventilador de Mão Turbo', 'eletronicos', 23, 59.9, NULL, '["Recarreg\u00e1vel", "Port\u00e1til", "Turbo"]', '["intermediario", "ventilador"]', '', 'inactive', true, 0, true, 'seed-script')
ON CONFLICT (id) DO UPDATE SET
    code = EXCLUDED.code,
    name = EXCLUDED.name,
    category_id = EXCLUDED.category_id,
    cost = EXCLUDED.cost,
    price = EXCLUDED.price,
    price_max = EXCLUDED.price_max,
    highlights = EXCLUDED.highlights,
    tags = EXCLUDED.tags,
    image_url = EXCLUDED.image_url,
    status = EXCLUDED.status,
    updated_by = EXCLUDED.updated_by;
INSERT INTO products (id, code, name, category_id, cost, price, price_max, highlights, tags, image_url, status, visible_to_client, qty_on_hand, track_stock, updated_by)
VALUES ('clim-umi', 'S148 FS-30-2', 'Mini Climatizador Umidificador', 'eletronicos', 47.5, 119.9, NULL, '["Umidifica\u00e7\u00e3o", "Dupla camada", "Compacto"]', '["intermediario", "climatizador"]', '', 'inactive', true, 0, true, 'seed-script')
ON CONFLICT (id) DO UPDATE SET
    code = EXCLUDED.code,
    name = EXCLUDED.name,
    category_id = EXCLUDED.category_id,
    cost = EXCLUDED.cost,
    price = EXCLUDED.price,
    price_max = EXCLUDED.price_max,
    highlights = EXCLUDED.highlights,
    tags = EXCLUDED.tags,
    image_url = EXCLUDED.image_url,
    status = EXCLUDED.status,
    updated_by = EXCLUDED.updated_by;
INSERT INTO products (id, code, name, category_id, cost, price, price_max, highlights, tags, image_url, status, visible_to_client, qty_on_hand, track_stock, updated_by)
VALUES ('lamp-vent', 'S182 AJ-M11-B', 'Lâmpada Ventilador Teto 60W', 'eletronicos', 43, 109.9, NULL, '["6 p\u00e1s", "Controle remoto", "Bivolt"]', '["intermediario", "ventilador"]', '', 'inactive', true, 0, true, 'seed-script')
ON CONFLICT (id) DO UPDATE SET
    code = EXCLUDED.code,
    name = EXCLUDED.name,
    category_id = EXCLUDED.category_id,
    cost = EXCLUDED.cost,
    price = EXCLUDED.price,
    price_max = EXCLUDED.price_max,
    highlights = EXCLUDED.highlights,
    tags = EXCLUDED.tags,
    image_url = EXCLUDED.image_url,
    status = EXCLUDED.status,
    updated_by = EXCLUDED.updated_by;
INSERT INTO products (id, code, name, category_id, cost, price, price_max, highlights, tags, image_url, status, visible_to_client, qty_on_hand, track_stock, updated_by)
VALUES ('vent-teto42', 'H79', 'Ventilador Teto 42" Industrial', 'eletronicos', 205, 499, NULL, '["6 velocidades", "Controle remoto", "Industrial"]', '["premium", "ventilador"]', '', 'inactive', true, 0, true, 'seed-script')
ON CONFLICT (id) DO UPDATE SET
    code = EXCLUDED.code,
    name = EXCLUDED.name,
    category_id = EXCLUDED.category_id,
    cost = EXCLUDED.cost,
    price = EXCLUDED.price,
    price_max = EXCLUDED.price_max,
    highlights = EXCLUDED.highlights,
    tags = EXCLUDED.tags,
    image_url = EXCLUDED.image_url,
    status = EXCLUDED.status,
    updated_by = EXCLUDED.updated_by;
INSERT INTO products (id, code, name, category_id, cost, price, price_max, highlights, tags, image_url, status, visible_to_client, qty_on_hand, track_stock, updated_by)
VALUES ('webcam1', 'L210 AL-ZP209', 'Webcam Full HD 1080p USB', 'cameras', 20.5, 59.9, 79.9, '["Vis\u00e3o 360\u00ba", "Videoconfer\u00eancia", "Plug and play"]', '["entrada", "webcam", "mais-vendido"]', 'images/webcam1.jpg', 'active', true, 0, true, 'seed-script')
ON CONFLICT (id) DO UPDATE SET
    code = EXCLUDED.code,
    name = EXCLUDED.name,
    category_id = EXCLUDED.category_id,
    cost = EXCLUDED.cost,
    price = EXCLUDED.price,
    price_max = EXCLUDED.price_max,
    highlights = EXCLUDED.highlights,
    tags = EXCLUDED.tags,
    image_url = EXCLUDED.image_url,
    status = EXCLUDED.status,
    updated_by = EXCLUDED.updated_by;
INSERT INTO products (id, code, name, category_id, cost, price, price_max, highlights, tags, image_url, status, visible_to_client, qty_on_hand, track_stock, updated_by)
VALUES ('webcam2', 'L193 Webcam 1080P', 'Webcam Full HD 1080p USB 2.0', 'cameras', 23, 69.9, 79.9, '["Plug and play", "Windows/Mac", "Full HD"]', '["entrada", "webcam"]', '', 'inactive', true, 0, true, 'seed-script')
ON CONFLICT (id) DO UPDATE SET
    code = EXCLUDED.code,
    name = EXCLUDED.name,
    category_id = EXCLUDED.category_id,
    cost = EXCLUDED.cost,
    price = EXCLUDED.price,
    price_max = EXCLUDED.price_max,
    highlights = EXCLUDED.highlights,
    tags = EXCLUDED.tags,
    image_url = EXCLUDED.image_url,
    status = EXCLUDED.status,
    updated_by = EXCLUDED.updated_by;
INSERT INTO products (id, code, name, category_id, cost, price, price_max, highlights, tags, image_url, status, visible_to_client, qty_on_hand, track_stock, updated_by)
VALUES ('cam-seg-noite', 'J23 LEY-90-v380', 'Câmera Segurança Visão Noturna', 'cameras', 45, 129.9, NULL, '["App Yoosee/V380", "L\u00e2mpada integrada", "Vis\u00e3o noturna"]', '["intermediario", "camera-seguranca", "mais-vendido"]', 'images/cam-seg-noite.jpg', 'active', true, 0, true, 'seed-script')
ON CONFLICT (id) DO UPDATE SET
    code = EXCLUDED.code,
    name = EXCLUDED.name,
    category_id = EXCLUDED.category_id,
    cost = EXCLUDED.cost,
    price = EXCLUDED.price,
    price_max = EXCLUDED.price_max,
    highlights = EXCLUDED.highlights,
    tags = EXCLUDED.tags,
    image_url = EXCLUDED.image_url,
    status = EXCLUDED.status,
    updated_by = EXCLUDED.updated_by;
INSERT INTO products (id, code, name, category_id, cost, price, price_max, highlights, tags, image_url, status, visible_to_client, qty_on_hand, track_stock, updated_by)
VALUES ('cam-ip-ptz', 'J07 AJ-A06-B', 'Câmera IP PTZ Varredura Automática', 'cameras', 56.5, 149.9, NULL, '["Pan/Tilt remoto", "Vis\u00e3o noturna", "IP"]', '["intermediario", "camera-seguranca"]', '', 'inactive', true, 0, true, 'seed-script')
ON CONFLICT (id) DO UPDATE SET
    code = EXCLUDED.code,
    name = EXCLUDED.name,
    category_id = EXCLUDED.category_id,
    cost = EXCLUDED.cost,
    price = EXCLUDED.price,
    price_max = EXCLUDED.price_max,
    highlights = EXCLUDED.highlights,
    tags = EXCLUDED.tags,
    image_url = EXCLUDED.image_url,
    status = EXCLUDED.status,
    updated_by = EXCLUDED.updated_by;
INSERT INTO products (id, code, name, category_id, cost, price, price_max, highlights, tags, image_url, status, visible_to_client, qty_on_hand, track_stock, updated_by)
VALUES ('cam-tomada', 'J33 AJ-A15-B', 'Câmera Tomada Wi-Fi', 'cameras', 59.99, 139.9, 169, '["Disfar\u00e7ada de tomada", "App Yoosee", "Wi-Fi"]', '["intermediario", "camera-seguranca"]', '', 'inactive', true, 0, true, 'seed-script')
ON CONFLICT (id) DO UPDATE SET
    code = EXCLUDED.code,
    name = EXCLUDED.name,
    category_id = EXCLUDED.category_id,
    cost = EXCLUDED.cost,
    price = EXCLUDED.price,
    price_max = EXCLUDED.price_max,
    highlights = EXCLUDED.highlights,
    tags = EXCLUDED.tags,
    image_url = EXCLUDED.image_url,
    status = EXCLUDED.status,
    updated_by = EXCLUDED.updated_by;
INSERT INTO products (id, code, name, category_id, cost, price, price_max, highlights, tags, image_url, status, visible_to_client, qty_on_hand, track_stock, updated_by)
VALUES ('cam-seg-ext', 'J41 P20-SP3', 'Câmera Segurança Externa 4K Wi-Fi', 'cameras', 185, 399.9, 499, '["3 lentes", "360\u00b0", "Zoom \u00f3ptico", "IA"]', '["premium", "camera-seguranca"]', '', 'inactive', true, 0, true, 'seed-script')
ON CONFLICT (id) DO UPDATE SET
    code = EXCLUDED.code,
    name = EXCLUDED.name,
    category_id = EXCLUDED.category_id,
    cost = EXCLUDED.cost,
    price = EXCLUDED.price,
    price_max = EXCLUDED.price_max,
    highlights = EXCLUDED.highlights,
    tags = EXCLUDED.tags,
    image_url = EXCLUDED.image_url,
    status = EXCLUDED.status,
    updated_by = EXCLUDED.updated_by;
INSERT INTO products (id, code, name, category_id, cost, price, price_max, highlights, tags, image_url, status, visible_to_client, qty_on_hand, track_stock, updated_by)
VALUES ('cam-digital', 'Estudante', 'Câmera Digital 4K com Zoom', 'cameras', 83, 199.9, NULL, '["48MP", "Zoom", "Tela flip 180\u00b0"]', '["premium", "camera-digital"]', '', 'inactive', true, 0, true, 'seed-script')
ON CONFLICT (id) DO UPDATE SET
    code = EXCLUDED.code,
    name = EXCLUDED.name,
    category_id = EXCLUDED.category_id,
    cost = EXCLUDED.cost,
    price = EXCLUDED.price,
    price_max = EXCLUDED.price_max,
    highlights = EXCLUDED.highlights,
    tags = EXCLUDED.tags,
    image_url = EXCLUDED.image_url,
    status = EXCLUDED.status,
    updated_by = EXCLUDED.updated_by;
INSERT INTO products (id, code, name, category_id, cost, price, price_max, highlights, tags, image_url, status, visible_to_client, qty_on_hand, track_stock, updated_by)
VALUES ('cam-acao', 'J10 D800', 'Câmera de Ação Esportes 4K', 'cameras', 73, 199.9, NULL, '["\u00c0 prova d''\u00e1gua", "Mergulho/trilha/moto", "4K"]', '["premium", "camera-acao", "esportivo"]', 'images/cam-acao.jpg', 'active', true, 0, true, 'seed-script')
ON CONFLICT (id) DO UPDATE SET
    code = EXCLUDED.code,
    name = EXCLUDED.name,
    category_id = EXCLUDED.category_id,
    cost = EXCLUDED.cost,
    price = EXCLUDED.price,
    price_max = EXCLUDED.price_max,
    highlights = EXCLUDED.highlights,
    tags = EXCLUDED.tags,
    image_url = EXCLUDED.image_url,
    status = EXCLUDED.status,
    updated_by = EXCLUDED.updated_by;
INSERT INTO products (id, code, name, category_id, cost, price, price_max, highlights, tags, image_url, status, visible_to_client, qty_on_hand, track_stock, updated_by)
VALUES ('filmadora', 'J05 KA-S270', 'Filmadora Digital Handycam Vintage', 'cameras', 113, 279.9, NULL, '["Zoom 16x", "Full HD", "At\u00e9 128GB"]', '["premium", "filmadora"]', '', 'inactive', true, 0, true, 'seed-script')
ON CONFLICT (id) DO UPDATE SET
    code = EXCLUDED.code,
    name = EXCLUDED.name,
    category_id = EXCLUDED.category_id,
    cost = EXCLUDED.cost,
    price = EXCLUDED.price,
    price_max = EXCLUDED.price_max,
    highlights = EXCLUDED.highlights,
    tags = EXCLUDED.tags,
    image_url = EXCLUDED.image_url,
    status = EXCLUDED.status,
    updated_by = EXCLUDED.updated_by;
INSERT INTO products (id, code, name, category_id, cost, price, price_max, highlights, tags, image_url, status, visible_to_client, qty_on_hand, track_stock, updated_by)
VALUES ('dashcam', 'L111 KA-2490', 'Dashcam DVR HD 1080P 3 Lentes', 'cameras', 63.99, 169.9, NULL, '["3 vias", "Grava\u00e7\u00e3o cont\u00ednua", "1080p"]', '["intermediario", "dashcam", "moto"]', '', 'inactive', true, 0, true, 'seed-script')
ON CONFLICT (id) DO UPDATE SET
    code = EXCLUDED.code,
    name = EXCLUDED.name,
    category_id = EXCLUDED.category_id,
    cost = EXCLUDED.cost,
    price = EXCLUDED.price,
    price_max = EXCLUDED.price_max,
    highlights = EXCLUDED.highlights,
    tags = EXCLUDED.tags,
    image_url = EXCLUDED.image_url,
    status = EXCLUDED.status,
    updated_by = EXCLUDED.updated_by;
INSERT INTO products (id, code, name, category_id, cost, price, price_max, highlights, tags, image_url, status, visible_to_client, qty_on_hand, track_stock, updated_by)
VALUES ('carreg-veic-120w', 'V67 KA-C205', 'Carregador Veicular Turbo 120W', 'cameras', 18.5, 49.9, NULL, '["3 soquetes", "PD + QC 3.0", "Carro"]', '["entrada", "carregador-veicular"]', '', 'inactive', true, 0, true, 'seed-script')
ON CONFLICT (id) DO UPDATE SET
    code = EXCLUDED.code,
    name = EXCLUDED.name,
    category_id = EXCLUDED.category_id,
    cost = EXCLUDED.cost,
    price = EXCLUDED.price,
    price_max = EXCLUDED.price_max,
    highlights = EXCLUDED.highlights,
    tags = EXCLUDED.tags,
    image_url = EXCLUDED.image_url,
    status = EXCLUDED.status,
    updated_by = EXCLUDED.updated_by;
INSERT INTO products (id, code, name, category_id, cost, price, price_max, highlights, tags, image_url, status, visible_to_client, qty_on_hand, track_stock, updated_by)
VALUES ('fonte-turbo1usb', 'D205 Y02-7', 'Fonte Carregador Universal Turbo 1 USB', 'acessorios', 5.99, 19.9, 25, '["2.1A", "B\u00e1sico", "Universal"]', '["entrada", "fonte", "mais-vendido"]', '', 'inactive', true, 0, true, 'seed-script')
ON CONFLICT (id) DO UPDATE SET
    code = EXCLUDED.code,
    name = EXCLUDED.name,
    category_id = EXCLUDED.category_id,
    cost = EXCLUDED.cost,
    price = EXCLUDED.price,
    price_max = EXCLUDED.price_max,
    highlights = EXCLUDED.highlights,
    tags = EXCLUDED.tags,
    image_url = EXCLUDED.image_url,
    status = EXCLUDED.status,
    updated_by = EXCLUDED.updated_by;
INSERT INTO products (id, code, name, category_id, cost, price, price_max, highlights, tags, image_url, status, visible_to_client, qty_on_hand, track_stock, updated_by)
VALUES ('fonte-gan20w', 'D182 KD-662', 'Fonte Carregador Tipo C Turbo GAN 20W', 'acessorios', 13.99, 39.9, NULL, '["Tecnologia GAN", "20W", "Tipo C"]', '["entrada", "fonte"]', '', 'inactive', true, 0, true, 'seed-script')
ON CONFLICT (id) DO UPDATE SET
    code = EXCLUDED.code,
    name = EXCLUDED.name,
    category_id = EXCLUDED.category_id,
    cost = EXCLUDED.cost,
    price = EXCLUDED.price,
    price_max = EXCLUDED.price_max,
    highlights = EXCLUDED.highlights,
    tags = EXCLUDED.tags,
    image_url = EXCLUDED.image_url,
    status = EXCLUDED.status,
    updated_by = EXCLUDED.updated_by;
INSERT INTO products (id, code, name, category_id, cost, price, price_max, highlights, tags, image_url, status, visible_to_client, qty_on_hand, track_stock, updated_by)
VALUES ('carreg-20w-cabo', 'D70 KD-108C', 'Carregador Tipo C Turbo 20W + Cabo 1m', 'acessorios', 18.5, 49.9, NULL, '["Kit completo Type-C", "20W", "Cabo 1m"]', '["intermediario", "kit", "carregador", "mais-vendido"]', 'images/carreg-20w-cabo.jpg', 'active', true, 0, true, 'seed-script')
ON CONFLICT (id) DO UPDATE SET
    code = EXCLUDED.code,
    name = EXCLUDED.name,
    category_id = EXCLUDED.category_id,
    cost = EXCLUDED.cost,
    price = EXCLUDED.price,
    price_max = EXCLUDED.price_max,
    highlights = EXCLUDED.highlights,
    tags = EXCLUDED.tags,
    image_url = EXCLUDED.image_url,
    status = EXCLUDED.status,
    updated_by = EXCLUDED.updated_by;
INSERT INTO products (id, code, name, category_id, cost, price, price_max, highlights, tags, image_url, status, visible_to_client, qty_on_hand, track_stock, updated_by)
VALUES ('carreg-40w-lig', 'J169 CA40-6', 'Carregador Turbo 40W PD + Cabo Lightning', 'acessorios', 15.8, 49.9, 55, '["PD", "Cabo Lightning 1m", "40W"]', '["intermediario", "kit", "carregador"]', '', 'inactive', true, 0, true, 'seed-script')
ON CONFLICT (id) DO UPDATE SET
    code = EXCLUDED.code,
    name = EXCLUDED.name,
    category_id = EXCLUDED.category_id,
    cost = EXCLUDED.cost,
    price = EXCLUDED.price,
    price_max = EXCLUDED.price_max,
    highlights = EXCLUDED.highlights,
    tags = EXCLUDED.tags,
    image_url = EXCLUDED.image_url,
    status = EXCLUDED.status,
    updated_by = EXCLUDED.updated_by;
INSERT INTO products (id, code, name, category_id, cost, price, price_max, highlights, tags, image_url, status, visible_to_client, qty_on_hand, track_stock, updated_by)
VALUES ('carreg-40w-tc', 'J170 CA40-7', 'Carregador Turbo 40W PD + Cabo Type-C', 'acessorios', 15.8, 49.9, 55, '["PD", "Cabo Type-C 1m", "40W"]', '["intermediario", "kit", "carregador"]', '', 'inactive', true, 0, true, 'seed-script')
ON CONFLICT (id) DO UPDATE SET
    code = EXCLUDED.code,
    name = EXCLUDED.name,
    category_id = EXCLUDED.category_id,
    cost = EXCLUDED.cost,
    price = EXCLUDED.price,
    price_max = EXCLUDED.price_max,
    highlights = EXCLUDED.highlights,
    tags = EXCLUDED.tags,
    image_url = EXCLUDED.image_url,
    status = EXCLUDED.status,
    updated_by = EXCLUDED.updated_by;
INSERT INTO products (id, code, name, category_id, cost, price, price_max, highlights, tags, image_url, status, visible_to_client, qty_on_hand, track_stock, updated_by)
VALUES ('carreg-veic-2usb', 'D225 L11-4', 'Carregador Veicular Turbo 2 USB 4.8A', 'acessorios', 6.5, 24.9, 29.9, '["Universal", "Carro/moto", "2 USB"]', '["entrada", "carregador-veicular", "mais-vendido"]', '', 'inactive', true, 0, true, 'seed-script')
ON CONFLICT (id) DO UPDATE SET
    code = EXCLUDED.code,
    name = EXCLUDED.name,
    category_id = EXCLUDED.category_id,
    cost = EXCLUDED.cost,
    price = EXCLUDED.price,
    price_max = EXCLUDED.price_max,
    highlights = EXCLUDED.highlights,
    tags = EXCLUDED.tags,
    image_url = EXCLUDED.image_url,
    status = EXCLUDED.status,
    updated_by = EXCLUDED.updated_by;
INSERT INTO products (id, code, name, category_id, cost, price, price_max, highlights, tags, image_url, status, visible_to_client, qty_on_hand, track_stock, updated_by)
VALUES ('carreg-2ent-20w', 'Z63 CQ-1501CL', 'Carregador Turbo 2 Entradas 20W GAN', 'acessorios', 19.99, 49.9, NULL, '["KAIDI Cube Pro", "Compacto", "20W GAN"]', '["intermediario", "carregador"]', 'images/carreg-2ent-20w.jpg', 'active', true, 0, true, 'seed-script')
ON CONFLICT (id) DO UPDATE SET
    code = EXCLUDED.code,
    name = EXCLUDED.name,
    category_id = EXCLUDED.category_id,
    cost = EXCLUDED.cost,
    price = EXCLUDED.price,
    price_max = EXCLUDED.price_max,
    highlights = EXCLUDED.highlights,
    tags = EXCLUDED.tags,
    image_url = EXCLUDED.image_url,
    status = EXCLUDED.status,
    updated_by = EXCLUDED.updated_by;
INSERT INTO products (id, code, name, category_id, cost, price, price_max, highlights, tags, image_url, status, visible_to_client, qty_on_hand, track_stock, updated_by)
VALUES ('cabo-v8-3a', 'Z52 KD-355M', 'Cabo USB V8 Turbo Rápido 3A', 'acessorios', 3.99, 17.9, NULL, '["Micro-USB", "Refor\u00e7ado", "Carga r\u00e1pida 3A"]', '["entrada", "cabo", "mais-vendido"]', '', 'active', true, 0, true, 'seed-script')
ON CONFLICT (id) DO UPDATE SET
    code = EXCLUDED.code,
    name = EXCLUDED.name,
    category_id = EXCLUDED.category_id,
    cost = EXCLUDED.cost,
    price = EXCLUDED.price,
    price_max = EXCLUDED.price_max,
    highlights = EXCLUDED.highlights,
    tags = EXCLUDED.tags,
    image_url = EXCLUDED.image_url,
    status = EXCLUDED.status,
    updated_by = EXCLUDED.updated_by;
INSERT INTO products (id, code, name, category_id, cost, price, price_max, highlights, tags, image_url, status, visible_to_client, qty_on_hand, track_stock, updated_by)
VALUES ('cabo-tc-light', 'Z20 KD-104CL', 'Cabo Tipo-C para Lightning Super Rápido', 'acessorios', 12.5, 39.9, NULL, '["KAIDI", "iPhone com fonte Type-C", "Super r\u00e1pido"]', '["entrada", "cabo"]', '', 'inactive', true, 0, true, 'seed-script')
ON CONFLICT (id) DO UPDATE SET
    code = EXCLUDED.code,
    name = EXCLUDED.name,
    category_id = EXCLUDED.category_id,
    cost = EXCLUDED.cost,
    price = EXCLUDED.price,
    price_max = EXCLUDED.price_max,
    highlights = EXCLUDED.highlights,
    tags = EXCLUDED.tags,
    image_url = EXCLUDED.image_url,
    status = EXCLUDED.status,
    updated_by = EXCLUDED.updated_by;
INSERT INTO products (id, code, name, category_id, cost, price, price_max, highlights, tags, image_url, status, visible_to_client, qty_on_hand, track_stock, updated_by)
VALUES ('cabo-120w', '2M Cabo Turbo 120W', 'Cabo 120W Liga Alumínio Carga Rápida 6A (2M)', 'acessorios', 4.5, 19.9, NULL, '["V8", "2 metros", "Alum\u00ednio"]', '["entrada", "cabo"]', '', 'inactive', true, 0, true, 'seed-script')
ON CONFLICT (id) DO UPDATE SET
    code = EXCLUDED.code,
    name = EXCLUDED.name,
    category_id = EXCLUDED.category_id,
    cost = EXCLUDED.cost,
    price = EXCLUDED.price,
    price_max = EXCLUDED.price_max,
    highlights = EXCLUDED.highlights,
    tags = EXCLUDED.tags,
    image_url = EXCLUDED.image_url,
    status = EXCLUDED.status,
    updated_by = EXCLUDED.updated_by;
INSERT INTO products (id, code, name, category_id, cost, price, price_max, highlights, tags, image_url, status, visible_to_client, qty_on_hand, track_stock, updated_by)
VALUES ('cabo-otg-v8', 'C50 OTG V8', 'Cabo Adaptador Micro USB OTG', 'acessorios', 1.3, 9.9, NULL, '["Conecta pendrive/mouse no celular", "OTG", "Micro USB"]', '["entrada", "cabo", "otg"]', '', 'inactive', true, 0, true, 'seed-script')
ON CONFLICT (id) DO UPDATE SET
    code = EXCLUDED.code,
    name = EXCLUDED.name,
    category_id = EXCLUDED.category_id,
    cost = EXCLUDED.cost,
    price = EXCLUDED.price,
    price_max = EXCLUDED.price_max,
    highlights = EXCLUDED.highlights,
    tags = EXCLUDED.tags,
    image_url = EXCLUDED.image_url,
    status = EXCLUDED.status,
    updated_by = EXCLUDED.updated_by;
INSERT INTO products (id, code, name, category_id, cost, price, price_max, highlights, tags, image_url, status, visible_to_client, qty_on_hand, track_stock, updated_by)
VALUES ('cabo-retra', 'Vários', 'Cabo Retrátil USB-C/Lightning Display LED', 'acessorios', 14.5, 39.9, NULL, '["120W", "Retr\u00e1til", "Display LED"]', '["entrada", "cabo"]', '', 'inactive', true, 0, true, 'seed-script')
ON CONFLICT (id) DO UPDATE SET
    code = EXCLUDED.code,
    name = EXCLUDED.name,
    category_id = EXCLUDED.category_id,
    cost = EXCLUDED.cost,
    price = EXCLUDED.price,
    price_max = EXCLUDED.price_max,
    highlights = EXCLUDED.highlights,
    tags = EXCLUDED.tags,
    image_url = EXCLUDED.image_url,
    status = EXCLUDED.status,
    updated_by = EXCLUDED.updated_by;
INSERT INTO products (id, code, name, category_id, cost, price, price_max, highlights, tags, image_url, status, visible_to_client, qty_on_hand, track_stock, updated_by)
VALUES ('sup-brac', 'S137 BT001', 'Braçadeira Suporte Celular 7"', 'acessorios', 5.3, 19.9, NULL, '["Corrida", "Treino", "Academia", "Bike"]', '["entrada", "suporte"]', '', 'inactive', true, 0, true, 'seed-script')
ON CONFLICT (id) DO UPDATE SET
    code = EXCLUDED.code,
    name = EXCLUDED.name,
    category_id = EXCLUDED.category_id,
    cost = EXCLUDED.cost,
    price = EXCLUDED.price,
    price_max = EXCLUDED.price_max,
    highlights = EXCLUDED.highlights,
    tags = EXCLUDED.tags,
    image_url = EXCLUDED.image_url,
    status = EXCLUDED.status,
    updated_by = EXCLUDED.updated_by;
INSERT INTO products (id, code, name, category_id, cost, price, price_max, highlights, tags, image_url, status, visible_to_client, qty_on_hand, track_stock, updated_by)
VALUES ('sup-mesa', 'F24', 'Suporte Universal Mesa Dobrável', 'acessorios', 2.8, 14.9, 19.9, '["Tablet e celular", "Ajust\u00e1vel", "Dobr\u00e1vel"]', '["entrada", "suporte", "mais-vendido"]', '', 'inactive', true, 0, true, 'seed-script')
ON CONFLICT (id) DO UPDATE SET
    code = EXCLUDED.code,
    name = EXCLUDED.name,
    category_id = EXCLUDED.category_id,
    cost = EXCLUDED.cost,
    price = EXCLUDED.price,
    price_max = EXCLUDED.price_max,
    highlights = EXCLUDED.highlights,
    tags = EXCLUDED.tags,
    image_url = EXCLUDED.image_url,
    status = EXCLUDED.status,
    updated_by = EXCLUDED.updated_by;
INSERT INTO products (id, code, name, category_id, cost, price, price_max, highlights, tags, image_url, status, visible_to_client, qty_on_hand, track_stock, updated_by)
VALUES ('sup-carro', 'S71 SP-165', 'Suporte Universal Carro/Moto/GPS', 'acessorios', 9.5, 34.9, NULL, '["Painel ou parabrisa", "Universal", "Carro/moto"]', '["entrada", "suporte", "moto"]', '', 'inactive', true, 0, true, 'seed-script')
ON CONFLICT (id) DO UPDATE SET
    code = EXCLUDED.code,
    name = EXCLUDED.name,
    category_id = EXCLUDED.category_id,
    cost = EXCLUDED.cost,
    price = EXCLUDED.price,
    price_max = EXCLUDED.price_max,
    highlights = EXCLUDED.highlights,
    tags = EXCLUDED.tags,
    image_url = EXCLUDED.image_url,
    status = EXCLUDED.status,
    updated_by = EXCLUDED.updated_by;
INSERT INTO products (id, code, name, category_id, cost, price, price_max, highlights, tags, image_url, status, visible_to_client, qty_on_hand, track_stock, updated_by)
VALUES ('capa-imper', 'S125 AL-2737', 'Capa Bolsa Celular Impermeável', 'acessorios', 4.3, 19.9, NULL, '["Mergulho", "Piscina", "Praia"]', '["entrada", "capa"]', '', 'inactive', true, 0, true, 'seed-script')
ON CONFLICT (id) DO UPDATE SET
    code = EXCLUDED.code,
    name = EXCLUDED.name,
    category_id = EXCLUDED.category_id,
    cost = EXCLUDED.cost,
    price = EXCLUDED.price,
    price_max = EXCLUDED.price_max,
    highlights = EXCLUDED.highlights,
    tags = EXCLUDED.tags,
    image_url = EXCLUDED.image_url,
    status = EXCLUDED.status,
    updated_by = EXCLUDED.updated_by;
INSERT INTO products (id, code, name, category_id, cost, price, price_max, highlights, tags, image_url, status, visible_to_client, qty_on_hand, track_stock, updated_by)
VALUES ('capa-pass', 'V104 BM-F4124', 'Capa Passaporte Couro RFID', 'acessorios', 11.8, 34.9, NULL, '["Prote\u00e7\u00e3o contra fraude", "Couro", "RFID"]', '["entrada", "capa"]', '', 'inactive', true, 0, true, 'seed-script')
ON CONFLICT (id) DO UPDATE SET
    code = EXCLUDED.code,
    name = EXCLUDED.name,
    category_id = EXCLUDED.category_id,
    cost = EXCLUDED.cost,
    price = EXCLUDED.price,
    price_max = EXCLUDED.price_max,
    highlights = EXCLUDED.highlights,
    tags = EXCLUDED.tags,
    image_url = EXCLUDED.image_url,
    status = EXCLUDED.status,
    updated_by = EXCLUDED.updated_by;
INSERT INTO products (id, code, name, category_id, cost, price, price_max, highlights, tags, image_url, status, visible_to_client, qty_on_hand, track_stock, updated_by)
VALUES ('pendrive-metal-4', 'A01-1', 'NOVA Mini Pendrive Metal 4GB', 'armazenamento', 16.5, 34.9, NULL, '["Chaveiro metal", "AGOLD", "Compacto"]', '["entrada", "pendrive"]', '', 'inactive', true, 0, true, 'seed-script')
ON CONFLICT (id) DO UPDATE SET
    code = EXCLUDED.code,
    name = EXCLUDED.name,
    category_id = EXCLUDED.category_id,
    cost = EXCLUDED.cost,
    price = EXCLUDED.price,
    price_max = EXCLUDED.price_max,
    highlights = EXCLUDED.highlights,
    tags = EXCLUDED.tags,
    image_url = EXCLUDED.image_url,
    status = EXCLUDED.status,
    updated_by = EXCLUDED.updated_by;
INSERT INTO products (id, code, name, category_id, cost, price, price_max, highlights, tags, image_url, status, visible_to_client, qty_on_hand, track_stock, updated_by)
VALUES ('pendrive-metal-8', 'A01-2', 'NOVA Mini Pendrive Metal 8GB', 'armazenamento', 18.8, 39.9, NULL, '["Chaveiro metal", "AGOLD", "8GB"]', '["entrada", "pendrive"]', '', 'inactive', true, 0, true, 'seed-script')
ON CONFLICT (id) DO UPDATE SET
    code = EXCLUDED.code,
    name = EXCLUDED.name,
    category_id = EXCLUDED.category_id,
    cost = EXCLUDED.cost,
    price = EXCLUDED.price,
    price_max = EXCLUDED.price_max,
    highlights = EXCLUDED.highlights,
    tags = EXCLUDED.tags,
    image_url = EXCLUDED.image_url,
    status = EXCLUDED.status,
    updated_by = EXCLUDED.updated_by;
INSERT INTO products (id, code, name, category_id, cost, price, price_max, highlights, tags, image_url, status, visible_to_client, qty_on_hand, track_stock, updated_by)
VALUES ('pendrive-metal-16', 'A01-3', 'NOVA Mini Pendrive Metal 16GB', 'armazenamento', 22.5, 39.9, 40, '["Chaveiro metal", "AGOLD", "16GB"]', '["entrada", "pendrive"]', '', 'inactive', true, 0, true, 'seed-script')
ON CONFLICT (id) DO UPDATE SET
    code = EXCLUDED.code,
    name = EXCLUDED.name,
    category_id = EXCLUDED.category_id,
    cost = EXCLUDED.cost,
    price = EXCLUDED.price,
    price_max = EXCLUDED.price_max,
    highlights = EXCLUDED.highlights,
    tags = EXCLUDED.tags,
    image_url = EXCLUDED.image_url,
    status = EXCLUDED.status,
    updated_by = EXCLUDED.updated_by;
INSERT INTO products (id, code, name, category_id, cost, price, price_max, highlights, tags, image_url, status, visible_to_client, qty_on_hand, track_stock, updated_by)
VALUES ('pendrive-metal-128', 'AGOLD', 'NOVA Mini Pendrive Metal 128GB', 'armazenamento', 53, 99.9, NULL, '["Alta capacidade", "Metal", "128GB"]', '["premium", "pendrive"]', '', 'inactive', true, 0, true, 'seed-script')
ON CONFLICT (id) DO UPDATE SET
    code = EXCLUDED.code,
    name = EXCLUDED.name,
    category_id = EXCLUDED.category_id,
    cost = EXCLUDED.cost,
    price = EXCLUDED.price,
    price_max = EXCLUDED.price_max,
    highlights = EXCLUDED.highlights,
    tags = EXCLUDED.tags,
    image_url = EXCLUDED.image_url,
    status = EXCLUDED.status,
    updated_by = EXCLUDED.updated_by;
INSERT INTO products (id, code, name, category_id, cost, price, price_max, highlights, tags, image_url, status, visible_to_client, qty_on_hand, track_stock, updated_by)
VALUES ('pendrive-16gb', 'A28', 'Pen Drive USB 2.0 16GB Original', 'armazenamento', 22.5, 39.9, 40, '["Lacrado", "GRANIA/KUP", "Original"]', '["entrada", "pendrive"]', '', 'inactive', true, 0, true, 'seed-script')
ON CONFLICT (id) DO UPDATE SET
    code = EXCLUDED.code,
    name = EXCLUDED.name,
    category_id = EXCLUDED.category_id,
    cost = EXCLUDED.cost,
    price = EXCLUDED.price,
    price_max = EXCLUDED.price_max,
    highlights = EXCLUDED.highlights,
    tags = EXCLUDED.tags,
    image_url = EXCLUDED.image_url,
    status = EXCLUDED.status,
    updated_by = EXCLUDED.updated_by;
INSERT INTO products (id, code, name, category_id, cost, price, price_max, highlights, tags, image_url, status, visible_to_client, qty_on_hand, track_stock, updated_by)
VALUES ('pendrive-64gb', 'A30', 'Pen Drive USB 2.0 64GB Original', 'armazenamento', 37.99, 59.9, NULL, '["3 anos garantia", "GRANIA", "Original"]', '["intermediario", "pendrive"]', '', 'inactive', true, 0, true, 'seed-script')
ON CONFLICT (id) DO UPDATE SET
    code = EXCLUDED.code,
    name = EXCLUDED.name,
    category_id = EXCLUDED.category_id,
    cost = EXCLUDED.cost,
    price = EXCLUDED.price,
    price_max = EXCLUDED.price_max,
    highlights = EXCLUDED.highlights,
    tags = EXCLUDED.tags,
    image_url = EXCLUDED.image_url,
    status = EXCLUDED.status,
    updated_by = EXCLUDED.updated_by;
INSERT INTO products (id, code, name, category_id, cost, price, price_max, highlights, tags, image_url, status, visible_to_client, qty_on_hand, track_stock, updated_by)
VALUES ('pendrive-2em1-8', 'A41 KA-R-8G', 'Pendrive 2 em 1 Type-C USB 3.0 8GB', 'armazenamento', 21, 59.9, NULL, '["Conector duplo USB-A + Type-C", "8GB", "Celular e PC"]', '["intermediario", "pendrive", "type-c"]', '', 'inactive', true, 0, true, 'seed-script')
ON CONFLICT (id) DO UPDATE SET
    code = EXCLUDED.code,
    name = EXCLUDED.name,
    category_id = EXCLUDED.category_id,
    cost = EXCLUDED.cost,
    price = EXCLUDED.price,
    price_max = EXCLUDED.price_max,
    highlights = EXCLUDED.highlights,
    tags = EXCLUDED.tags,
    image_url = EXCLUDED.image_url,
    status = EXCLUDED.status,
    updated_by = EXCLUDED.updated_by;
INSERT INTO products (id, code, name, category_id, cost, price, price_max, highlights, tags, image_url, status, visible_to_client, qty_on_hand, track_stock, updated_by)
VALUES ('sd-4gb', 'A50 HM-M04', 'Cartão Micro SD 4GB + Adaptador', 'armazenamento', 16.8, 29.9, 39.9, '["AGOLD/HMASTON", "Com adaptador SD", "4GB"]', '["entrada", "cartao-sd"]', '', 'inactive', true, 0, true, 'seed-script')
ON CONFLICT (id) DO UPDATE SET
    code = EXCLUDED.code,
    name = EXCLUDED.name,
    category_id = EXCLUDED.category_id,
    cost = EXCLUDED.cost,
    price = EXCLUDED.price,
    price_max = EXCLUDED.price_max,
    highlights = EXCLUDED.highlights,
    tags = EXCLUDED.tags,
    image_url = EXCLUDED.image_url,
    status = EXCLUDED.status,
    updated_by = EXCLUDED.updated_by;
INSERT INTO products (id, code, name, category_id, cost, price, price_max, highlights, tags, image_url, status, visible_to_client, qty_on_hand, track_stock, updated_by)
VALUES ('sd-8gb-onex', 'A62 X-M-8GB', 'Cartão Micro SD 8GB ONE X + Adaptador', 'armazenamento', 9.99, 29.9, 39.9, '["ONE X", "Custo-benef\u00edcio", "8GB"]', '["entrada", "cartao-sd", "mais-vendido"]', 'images/sd-8gb-onex.png', 'active', true, 0, true, 'seed-script')
ON CONFLICT (id) DO UPDATE SET
    code = EXCLUDED.code,
    name = EXCLUDED.name,
    category_id = EXCLUDED.category_id,
    cost = EXCLUDED.cost,
    price = EXCLUDED.price,
    price_max = EXCLUDED.price_max,
    highlights = EXCLUDED.highlights,
    tags = EXCLUDED.tags,
    image_url = EXCLUDED.image_url,
    status = EXCLUDED.status,
    updated_by = EXCLUDED.updated_by;
INSERT INTO products (id, code, name, category_id, cost, price, price_max, highlights, tags, image_url, status, visible_to_client, qty_on_hand, track_stock, updated_by)
VALUES ('sd-8gb-hmaston', 'A51 HM-M08', 'Cartão Micro SD 8GB HMASTON + Adaptador', 'armazenamento', 15.5, 29.9, 39.9, '["HMASTON", "Original", "8GB"]', '["entrada", "cartao-sd"]', '', 'inactive', true, 0, true, 'seed-script')
ON CONFLICT (id) DO UPDATE SET
    code = EXCLUDED.code,
    name = EXCLUDED.name,
    category_id = EXCLUDED.category_id,
    cost = EXCLUDED.cost,
    price = EXCLUDED.price,
    price_max = EXCLUDED.price_max,
    highlights = EXCLUDED.highlights,
    tags = EXCLUDED.tags,
    image_url = EXCLUDED.image_url,
    status = EXCLUDED.status,
    updated_by = EXCLUDED.updated_by;
INSERT INTO products (id, code, name, category_id, cost, price, price_max, highlights, tags, image_url, status, visible_to_client, qty_on_hand, track_stock, updated_by)
VALUES ('sd-16gb', 'A34', 'Cartão Micro SD 16GB Original', 'armazenamento', 29.99, 49.9, NULL, '["100% original", "2 anos garantia", "16GB"]', '["intermediario", "cartao-sd"]', '', 'inactive', true, 0, true, 'seed-script')
ON CONFLICT (id) DO UPDATE SET
    code = EXCLUDED.code,
    name = EXCLUDED.name,
    category_id = EXCLUDED.category_id,
    cost = EXCLUDED.cost,
    price = EXCLUDED.price,
    price_max = EXCLUDED.price_max,
    highlights = EXCLUDED.highlights,
    tags = EXCLUDED.tags,
    image_url = EXCLUDED.image_url,
    status = EXCLUDED.status,
    updated_by = EXCLUDED.updated_by;
INSERT INTO products (id, code, name, category_id, cost, price, price_max, highlights, tags, image_url, status, visible_to_client, qty_on_hand, track_stock, updated_by)
VALUES ('sd-32gb', 'A35', 'Cartão Micro SD 32GB Original', 'armazenamento', 39.99, 89.9, 109, '["3 anos garantia", "Alta confiabilidade", "32GB"]', '["intermediario", "cartao-sd"]', '', 'inactive', true, 0, true, 'seed-script')
ON CONFLICT (id) DO UPDATE SET
    code = EXCLUDED.code,
    name = EXCLUDED.name,
    category_id = EXCLUDED.category_id,
    cost = EXCLUDED.cost,
    price = EXCLUDED.price,
    price_max = EXCLUDED.price_max,
    highlights = EXCLUDED.highlights,
    tags = EXCLUDED.tags,
    image_url = EXCLUDED.image_url,
    status = EXCLUDED.status,
    updated_by = EXCLUDED.updated_by;
INSERT INTO products (id, code, name, category_id, cost, price, price_max, highlights, tags, image_url, status, visible_to_client, qty_on_hand, track_stock, updated_by)
VALUES ('leitor-sd-15', 'J212', 'Leitor Cartão Micro SD 15 em 1', 'armazenamento', 1.99, 14.9, NULL, '["Universal", "15 em 1", "Compacto"]', '["entrada", "leitor"]', '', 'inactive', true, 0, true, 'seed-script')
ON CONFLICT (id) DO UPDATE SET
    code = EXCLUDED.code,
    name = EXCLUDED.name,
    category_id = EXCLUDED.category_id,
    cost = EXCLUDED.cost,
    price = EXCLUDED.price,
    price_max = EXCLUDED.price_max,
    highlights = EXCLUDED.highlights,
    tags = EXCLUDED.tags,
    image_url = EXCLUDED.image_url,
    status = EXCLUDED.status,
    updated_by = EXCLUDED.updated_by;
INSERT INTO products (id, code, name, category_id, cost, price, price_max, highlights, tags, image_url, status, visible_to_client, qty_on_hand, track_stock, updated_by)
VALUES ('otg-light-sd', 'C47 PEI-CT09', 'Adaptador OTG Lightning para Micro SD', 'armazenamento', 14.99, 39.9, NULL, '["L\u00ea cart\u00e3o SD no iPhone", "OTG", "Lightning"]', '["entrada", "otg", "adaptador"]', '', 'inactive', true, 0, true, 'seed-script')
ON CONFLICT (id) DO UPDATE SET
    code = EXCLUDED.code,
    name = EXCLUDED.name,
    category_id = EXCLUDED.category_id,
    cost = EXCLUDED.cost,
    price = EXCLUDED.price,
    price_max = EXCLUDED.price_max,
    highlights = EXCLUDED.highlights,
    tags = EXCLUDED.tags,
    image_url = EXCLUDED.image_url,
    status = EXCLUDED.status,
    updated_by = EXCLUDED.updated_by;
INSERT INTO products (id, code, name, category_id, cost, price, price_max, highlights, tags, image_url, status, visible_to_client, qty_on_hand, track_stock, updated_by)
VALUES ('hub-c-3.0-4p', 'C125 NCB-507', 'Hub USB Type-C 3.0 Extensor 4 Portas LED', 'armazenamento', 10.5, 29.9, NULL, '["Design compacto", "LED", "4 portas"]', '["entrada", "hub", "type-c"]', '', 'inactive', true, 0, true, 'seed-script')
ON CONFLICT (id) DO UPDATE SET
    code = EXCLUDED.code,
    name = EXCLUDED.name,
    category_id = EXCLUDED.category_id,
    cost = EXCLUDED.cost,
    price = EXCLUDED.price,
    price_max = EXCLUDED.price_max,
    highlights = EXCLUDED.highlights,
    tags = EXCLUDED.tags,
    image_url = EXCLUDED.image_url,
    status = EXCLUDED.status,
    updated_by = EXCLUDED.updated_by;
INSERT INTO products (id, code, name, category_id, cost, price, price_max, highlights, tags, image_url, status, visible_to_client, qty_on_hand, track_stock, updated_by)
VALUES ('adap-tc-hdmi', 'C73 AU-578', 'Adaptador Tipo-C para HDMI 4K + USB 3.0', 'armazenamento', 15.8, 49.9, NULL, '["MacBook Air/Pro", "Sa\u00edda 4K", "USB 3.0"]', '["intermediario", "adaptador", "type-c"]', '', 'inactive', true, 0, true, 'seed-script')
ON CONFLICT (id) DO UPDATE SET
    code = EXCLUDED.code,
    name = EXCLUDED.name,
    category_id = EXCLUDED.category_id,
    cost = EXCLUDED.cost,
    price = EXCLUDED.price,
    price_max = EXCLUDED.price_max,
    highlights = EXCLUDED.highlights,
    tags = EXCLUDED.tags,
    image_url = EXCLUDED.image_url,
    status = EXCLUDED.status,
    updated_by = EXCLUDED.updated_by;
INSERT INTO products (id, code, name, category_id, cost, price, price_max, highlights, tags, image_url, status, visible_to_client, qty_on_hand, track_stock, updated_by)
VALUES ('hub-c-6em1', 'C134 BM-8642', 'Hub USB 3.0 Tipo-C 6 em 1 (RJ45 + HDMI)', 'armazenamento', 26.5, 89.9, 119, '["Laptop", "Porta de rede + v\u00eddeo", "6 em 1"]', '["intermediario", "hub", "type-c", "mais-vendido"]', 'images/hub-c-6em1.jpg', 'active', true, 0, true, 'seed-script')
ON CONFLICT (id) DO UPDATE SET
    code = EXCLUDED.code,
    name = EXCLUDED.name,
    category_id = EXCLUDED.category_id,
    cost = EXCLUDED.cost,
    price = EXCLUDED.price,
    price_max = EXCLUDED.price_max,
    highlights = EXCLUDED.highlights,
    tags = EXCLUDED.tags,
    image_url = EXCLUDED.image_url,
    status = EXCLUDED.status,
    updated_by = EXCLUDED.updated_by;
INSERT INTO products (id, code, name, category_id, cost, price, price_max, highlights, tags, image_url, status, visible_to_client, qty_on_hand, track_stock, updated_by)
VALUES ('hub-c-8em1', 'C29 HUB 8IN1', 'Adaptador Hub USB Tipo-C 8 em 1', 'armazenamento', 26, 89.9, 119, '["HDMI 4K", "RJ45", "USB 3.0", "SD/TF", "PD"]', '["intermediario", "hub", "type-c"]', '', 'inactive', true, 0, true, 'seed-script')
ON CONFLICT (id) DO UPDATE SET
    code = EXCLUDED.code,
    name = EXCLUDED.name,
    category_id = EXCLUDED.category_id,
    cost = EXCLUDED.cost,
    price = EXCLUDED.price,
    price_max = EXCLUDED.price_max,
    highlights = EXCLUDED.highlights,
    tags = EXCLUDED.tags,
    image_url = EXCLUDED.image_url,
    status = EXCLUDED.status,
    updated_by = EXCLUDED.updated_by;
INSERT INTO products (id, code, name, category_id, cost, price, price_max, highlights, tags, image_url, status, visible_to_client, qty_on_hand, track_stock, updated_by)
VALUES ('hub-ugreen-4', 'BM-8640', 'Hub 4 em 1 Ugreen USB-C 4x USB 3.0', 'armazenamento', 45, 119.9, NULL, '["Marca Ugreen", "Alta velocidade", "4x USB 3.0"]', '["premium", "hub", "ugreen", "sob-consulta"]', 'images/hub-ugreen-4.jpg', 'active', true, 0, true, 'seed-script')
ON CONFLICT (id) DO UPDATE SET
    code = EXCLUDED.code,
    name = EXCLUDED.name,
    category_id = EXCLUDED.category_id,
    cost = EXCLUDED.cost,
    price = EXCLUDED.price,
    price_max = EXCLUDED.price_max,
    highlights = EXCLUDED.highlights,
    tags = EXCLUDED.tags,
    image_url = EXCLUDED.image_url,
    status = EXCLUDED.status,
    updated_by = EXCLUDED.updated_by;