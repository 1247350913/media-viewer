INSERT INTO libraries (id, name, root_path)
VALUES (1, 'Movies', '/vault/Content/Movies')
ON CONFLICT(id) DO NOTHING;

INSERT INTO folders (id, library_id, parent_id, name, abs_path, mtime_ms) VALUES
  (10,1,NULL,'Movies','/vault/Content/Movies',0),
  (11,1,10,'300','/vault/Content/Movies/300',0),
  (12,1,11,'300','/vault/Content/Movies/300/300',0),
  (13,1,11,'Rise of an Empire','/vault/Content/Movies/300/Rise of an Empire',0),
  (30,1,10,'MCU','/vault/Content/Movies/MCU',0),
  (31,1,30,'Thor','/vault/Content/Movies/MCU/Thor',0),
  (32,1,31,'Thor1','/vault/Content/Movies/MCU/Thor/Thor1',0);

INSERT INTO titles (id, kind, parent_id, name, year) VALUES
  (20,'collection',NULL,'300',NULL),
  (21,'movie',20,'300',2006),
  (22,'movie',20,'300: Rise of an Empire',2014),
  (40,'collection',NULL,'MCU',NULL),
  (41,'collection',40,'Thor',NULL),
  (42,'movie',41,'Thor',2011);

INSERT INTO title_folders (title_id, folder_id, role) VALUES
  (20,11,'primary'),
  (21,12,'primary'),
  (22,13,'primary'),
  (40,30,'primary'),
  (41,31,'primary'),
  (42,32,'primary');

INSERT INTO files (id, folder_id, title_id, name, abs_path, ext, role, size_bytes, mtime_ms, hash, quality, runtime_sec, resolution_w, resolution_h, codec_video, codec_audio)
VALUES
  (70,12,21,'300.mkv','/vault/Content/Movies/300/300/300.mkv','.mkv','video',5230066784,0,NULL,'1080p',6780,1920,800,'H.264','DTS 5.1'),
  (71,12,21,'poster.jpg','/vault/Content/Movies/300/300/poster.jpg','.jpg','poster',123456,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
  (72,13,22,'Rise.mkv','/vault/Content/Movies/300/Rise of an Empire/Rise.mkv','.mkv','video',6000000000,0,NULL,'1080p',6360,1920,804,'H.264','AC3 5.1');
