window.onload = function(){

    //init user
	var userInfo = {};

	var bookData = {};

	var BOOK_ITEM_FLAG = "BOOK_";

	var BOOK_DOM_FLAG = "BOOK_";

	var bookList = T.g("bookList");

	var isLogin = false;

	var isSettingBoxShow = false;

	//网络数据与本地数据合并
	function mergeWithLocal(data){
		var temp = [];
		for(var i in data){
			if(bookData[i] == null){
				localStorage.setItem(BOOK_ITEM_FLAG + i, T.json.stringify(data[i]));
				addBookToView(data[i], true);
				temp.push(data[i]);
			}
		}
		for(var i in bookData){
			if(data[i] == null){
				//upload to server
				addBookToServer(bookData[i])
			}
		}
		for(var i=0; i<temp.length; i++){
			bookData[temp[i].id] = temp[i];
		}
	}

	function addBookToServer(book){
		T.ajax.post('/data/addbook', T.url.jsonToQuery(book), function(xhr, msg){
		});
	}

	function addBook(book){
		if(!book){
			return false;
		}
		book.createtime = Date.now().toString();
		var id = book.id = book.createtime + "_" + parseInt(Math.random() * 10000);
		book.status = "unread";
		bookData[id] = book;
		localStorage.setItem(BOOK_ITEM_FLAG + id, T.json.stringify(book));
		if(isLogin){
			addBookToServer(book);
		}
		return book;
	}

	function getBooks(){
		var books = {};
		var item = null;
		var name = null;
		for(var i=0; i<localStorage.length; i++){
			name = localStorage.key(i);
			if((new RegExp(BOOK_ITEM_FLAG)).test(name)){
				item = T.json.parse(localStorage[name]);
				books[item.id] = item;
			}
		}
		return books;
	}

	function addBookToView(book, before){
		var item = T.dom.create("div", {
			id: BOOK_DOM_FLAG + book.id,
			className: "bookItem",
			"book_id": book.id
		});
		var str = "<span class='bookName'>" + T.string.encodeHTML(book.name) + "</span><span class='removeBook' title='删除'></span>"
		item.innerHTML = str;
		if(before){
			var base = T.dom.first(bookList);
			if(base){
				T.dom.insertBefore(item, base);
			}else{
				bookList.appendChild(item);
			}
		}else{
			bookList.appendChild(item);
		}
		addBookItemDomEvent(item);
	}
	function addBookItemDomEvent(item){
		T.event.on(item, 'click', function(e){
			var type = e.target.className;
			var book_id = T.dom.getAttr(this, "book_id");
			switch(type){
				case "removeBook":
					removeBook(book_id);
					break;
			}
		});
	}
	function removeBook(id){
		if(!bookData[id]){
			return;
		}
		if(!confirm("确认要删除该书籍吗？")){
			return;
		}
		var dom = T.g(BOOK_DOM_FLAG + id);
		if(dom){
			T.dom.remove(dom);
		}
		localStorage.removeItem(BOOK_ITEM_FLAG + id);
		if(isLogin){
			//将服务器端的也删除
			T.ajax.post('/data/removebook', "id=" + id, function(xhr, msg){
				try{
					var data = T.json.parse(msg);
					if(data.result == "ok"){
					}
				}catch(e){

				}
			});
		}
		delete bookData[id];
		return true;
	}

	function showUserInfo(user){
		T.g("userInfo").innerHTML = "用户：" + T.string.encodeHTML(user.name) + "已经登陆";
	}

	function initData(){
		bookData = getBooks();
		//排序
		var temp = [];
		for(var i in bookData){
			temp.push(bookData[i]);
		}
		temp.sort(function(a, b){
			return a.createtime < b.createtime;
		});
		for(var i=0; i<temp.length; i++){
			addBookToView(temp[i]);
		}
		T.ajax.post('/data/getbooks', "", function(xhr, msg){
			try{
				var data = T.json.parse(msg);
				if(data.result == "ok"){
					isLogin = true;
					mergeWithLocal(data.content.books);
					showUserInfo({
						name: data.content.username
					});
				}
			}catch(e){

			}
		});
	}

	function initEvents(){
		T.event.on('addBook', 'click', function(e){
			var bookname = prompt("输入书籍名称");
			if(!bookname){
				return;
			}
			var book = addBook({
				name: bookname
			});
			if(book){
				addBookToView(book, true);
			}
		});

		T.event.on("setting", 'click', function(e){
			if(isSettingBoxShow){
				T.hide("settingBox");
				isSettingBoxShow = false;
			}else{
				T.show("settingBox");
				isSettingBoxShow = true;
			}
		});

		T.event.on('closeBtn', 'click', function(e){
			T.hide("settingBox");
			isSettingBoxShow = false;
		});
	}
	//page init
	initData();
	initEvents();
};