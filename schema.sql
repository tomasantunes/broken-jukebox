drop table if exists tracks;
create table tracks ( 
  id integer primary key autoincrement,
  filename text not null, 
	title text not null
);
