// This is the js for the default/index.html view.

var app = function() {

    var self = {};

    Vue.config.silent = false; // show all warnings

    // Extends an array
    self.extend = function(a, b) {
        for (var i = 0; i < b.length; i++) {
            a.push(b[i]);
        }
    };

    function get_post_url(start_idx, end_idx) {
        var pp = {
            start_idx: start_idx,
            end_idx: end_idx
        }
        return get_posts_url + "?" + $.param(pp)
    }

    //only called when page first loads
    self.get_posts = function () {
       $.getJSON(get_post_url(0, 4), function(data) {
            self.vue.posts = data.posts;
            self.vue.has_more = data.has_more;
            self.vue.logged_in = data.logged_in;
            self.vue.loggedin_user_email = data.loggedin_user_email;
        })

    };

    //loads four more posts
    self.get_more = function () {
        var num_posts = self.vue.posts.length
        $.getJSON(get_post_url(num_posts, num_posts + 4), function(data){
            self.vue.has_more = data.has_more;
            self.extend(self.vue.posts, data.posts);
        })
    };

    self.add_post_button = function() {
        self.vue.is_adding_post = !self.vue.is_adding_post;
    }

    //passes new post_content to the serve using ajax
    //waits until serve responds to the ajax post to add the new post to the page
    self.add_post = function () {
        $.post(add_post_url,
            {
                post_content: self.vue.form_content
            },
            function (data) {
                $.web2py.enableElement($("#add_post_submit"));
                self.vue.posts.unshift(data.post);
                self.vue.form_content = null;
            }
        )
    }

    self.delete_post = function(post_id) {
        $.post(del_post_url,
            {
                post_id: post_id
            },
            function () {
                //iterates over the post list to find the post to be deleted then deletes it from the post list using
                //splice. this all happens after the post has been deleted on the server end.
                var idx = null;
                for(var i = 0; i < self.vue.posts.length; i++) {
                    if (post_id === self.vue.posts[i].id){
                        idx = i + 1;
                        break;
                    }
                }
                if (idx) {
                        self.vue.posts.splice(idx - 1, 1);
                }
            }
        )
    }

    //currently editing variable is used to only display the edit textarea for the post that is
    //currently being edited. if there is no post currently being edited the default value of
    //currently_editing is 0 because no post has post_id 0
    self.update_currently_editing = function(post_id, post_content) {
        self.vue.currently_editing = post_id;
        //needed so the textarea initially has the content of the post
        self.vue.edit_content = post_content;
    }

    self.submit_edit = function(post_id) {
        $.post(edit_post_url,
            {
                post_id: post_id,
                edit_content: self.vue.edit_content
            },
            function (data) {
                //waits for server to edit the content on it's end, then gets the post_content and updated_on data.
                //then content and update_on are updated on the page.
                var idx = null;
                for(var i = 0; i< self.vue.posts.length; i++){
                    if(post_id === self.vue.posts[i].id){
                        idx = i;
                        break;
                    }
                }
                self.vue.posts[idx].post_content = data.post.post_content;
                self.vue.posts[idx].updated_on = data.post.updated_on;
                //after there is a post none of the posts should have a textarea displayed so currently editing is
                //set to zero. also edit_content is reset to null.
                self.vue.currently_editing = 0;
                self.vue.edit_content = null;
            }

        )
    }

    self.clear_edit_content = function() {
        self.vue.edit_content = null;
    }

    self.vue = new Vue({
        el: "#vue-div",
        delimiters: ['${', '}'],
        unsafeDelimiters: ['!{', '}'],
        data: {
            posts: [],
            has_more: false,
            is_adding_post: false,
            form_content: null,
            logged_in: false,
            loggedin_user_email: null,
            currently_editing: 0,
            edit_content: null
        },
        methods: {
            get_more: self.get_more,
            add_post_button: self.add_post_button,
            add_post: self.add_post,
            delete_post: self.delete_post,
            update_currently_editing: self.update_currently_editing,
            submit_edit: self.submit_edit,
            clear_edit_content: self.clear_edit_content
        }

    });

    self.get_posts();
    $("#vue-div").show();

    return self;
};

var APP = null;

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function(){APP = app();});
