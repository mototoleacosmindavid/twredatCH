use redat;
drop database redat;
create schema redat;
use redat;
create or replace table users
(
    ID              int auto_increment primary key,
    email           varchar(256) not null,
    pass            varchar(256) not null,
    first_name      varchar(256) not null,
    last_name       varchar(256) not null,
    reddit_username varchar(256) not null,
    reddit_password varchar(256) not null,
    constraint IndexEmail unique (email)
);
create or replace table tags
(
    ID      int auto_increment primary key,
    content varchar(32) not null,
    constraint IndexContent unique (content)
);
create or replace table users_tags
(
    ID      int auto_increment primary key,
    tag_ID  int not null,
    user_ID int not null,
    constraint TagID_FK foreign key (tag_ID) references tags (ID) on delete cascade,
    constraint UserID_FK foreign key (user_ID) references users (ID) on delete cascade
);

create or replace
    definer = root@localhost procedure Users_Login(IN in_email varchar(256), IN in_pass varchar(256))
begin
    declare v_user_exists int default 0;

    select COUNT(*) into v_user_exists from users where email = in_email and pass = in_pass;

    if 0 = v_user_exists then
        signal sqlstate '45000' set message_text = '#Invalid credentials#';
    end if;

    select * from users where email = in_email and pass = in_pass;
end;

create or replace
    definer = root@localhost procedure Users_Register(IN in_email varchar(256), IN in_pass varchar(256),
                                                      IN in_first_name varchar(256), IN in_last_name varchar(256),
                                                      IN in_reddit_username varchar(256),
                                                      IN in_reddit_password varchar(256))
begin
    declare v_user_exists int default 0;

    select COUNT(*) into v_user_exists from users where email = in_email;

    if 1 = v_user_exists then
        signal sqlstate '45000' set message_text = '#Email already in use#';
    end if;

    insert into users (email, pass, first_name, last_name, reddit_username, reddit_password)
    VALUES (in_email, in_pass, in_first_name, in_last_name, in_reddit_username, in_reddit_password);

    select * from users where ID = last_insert_id();
end;

create or replace
    definer = root@localhost procedure Tag_Add(IN in_acc_id int, IN in_content varchar(32))
begin
    declare v_user_exists int default 0;
    declare v_tag_exists int default 0;
    declare v_tag_id int default 0;

    select COUNT(*) into v_user_exists from users where ID = in_acc_id;

    if 0 = v_user_exists then
        signal sqlstate '45000' set message_text = '#Invalid user id#';
    end if;

    select count(*) into v_tag_exists from tags where content = in_content;

    if v_tag_exists = 0 then
        insert into tags (content) values (in_content);
        set v_tag_id = last_insert_id();
    else
        select ID into v_tag_id from tags where content = in_content limit 1;
    end if;

    insert into users_tags (tag_ID, user_ID) VALUES (v_tag_id, in_acc_id);

    select * from tags where ID = v_tag_id;

end;

