var globo_info   = 'https://api.github.com/orgs/globocom';
var globo_repos  = 'https://api.github.com/orgs/globocom/repos';

jQuery.githubUser = function(username, callback) {
   jQuery.getJSON('https://api.github.com/orgs/'+username+'/repos?per_page=100?callback=?',callback)
}
 
jQuery.fn.loadRepositories = function(username) {
    this.html('<span>Querying GitHub for ' + username +'\'s repositories...</span>');
     
    var target = this;
    $.githubUser(username, function(data) {
        var repos 		 = data.data, // JSON Parsing  
        	fullname     = this.name,
        	username     = this.login,
        	aviurl       = this.avatar_url,
        	profileurl   = this.html_url,
        	location     = this.location,
        	followersnum = this.followers,
        	followingnum = this.following,
        	reposnum     = this.public_repos;

        // sortByName(repos); 
     
        var list = $('<dl/>');
        target.empty().append(list);
        $(repos).each(function() {
            // if (this.name != (username.toLowerCase()+'.github.com')) {
                list.append('<dt><a href="'+ (this.homepage?this.homepage:this.html_url) +'">' + this.name + '</a></dt>');
            // }
        });      
      });
      
    function sortByName(repos) {
        repos.sort(function(a,b) {
        return a.name - b.name;
       });
    }
};
