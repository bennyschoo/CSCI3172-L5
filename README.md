# Lab 5

* *Date Created*: 06 March 2026
* *Last Modification Date*: 12 March 2026
* *Lab Timberlea URL*: <https://web.cs.dal.ca/~schoonhove/csci3172/labs/lab5/>
* *Lab Gitlab URL*: <https://git.cs.dal.ca/schoonhove/csci3172/-/tree/main/labs/Lab5>


## Authors

* [Ben Schoonhoven](benny@dal.ca) - (Author)

## Built With

<!--- Provide a list of the frameworks used to build this application, your list should include the name of the framework used, the url where the framework is available for download and what the framework was used for, see the example below --->

* [Bootstrap](https://getbootstrap.com/) - The styling framework used

## Sources Used

### Index.html and recommendation.html

*Lines 1-1* and *Lines 1-1* respectively

```
<div class="container"> 
        <footer class="d-flex flex-wrap justify-content-between align-items-center py-3 my-4 border-top">
            <p class="col-md-4 mb-0">© 2025 Company, Inc</p> 
            <a href="/" class="col-md-4 d-flex align-items-center justify-content-center" aria-label="Bootstrap"> 
                <img id="cat-logo" src="./img/cat.png" alt="cat logo image">
            </a> 
            <ul class="nav col-md-4 justify-content-end"> 
                <li class="nav-item"><a href="#" class="nav-link px-2 link-info">Home</a></li> 
                <li class="nav-item"><a href="./index.html" class="nav-link px-2 link-info">Sign up</a></li> 
                <li class="nav-item"><a href="./login.html" class="nav-link px-2 link-info">Login</a></li> 
                <li class="nav-item"><a href="#" class="nav-link px-2 link-info">FAQs</a></li> 
                <li class="nav-item"><a href="#" class="nav-link px-2 link-info">About</a></li> 
            </ul> 
        </footer> 
    </div>

```

The code above was created by adapting the code in [the Bootstrap footer examples](https://getbootstrap.com/docs/5.3/examples/footers/) as shown below: 

```
<div class="container"> 
    <footer class="d-flex flex-wrap justify-content-between align-items-center py-3 my-4 border-top"> 
        <p class="col-md-4 mb-0 text-body-secondary">© 2025 Company, Inc</p> 
        <a href="/" class="col-md-4 d-flex align-items-center justify-content-center mb-3 mb-md-0 me-md-auto link-body-emphasis text-decoration-none" aria-label="Bootstrap"> 
            <svg class="bi me-2" width="40" height="32" aria-hidden="true">
                <use xlink:href="#bootstrap"></use>
            </svg> 
        </a> 
        <ul class="nav col-md-4 justify-content-end"> 
            <li class="nav-item"><a href="#" class="nav-link px-2 text-body-secondary">Home</a></li> 
            <li class="nav-item"><a href="#" class="nav-link px-2 text-body-secondary">Features</a></li> 
            <li class="nav-item"><a href="#" class="nav-link px-2 text-body-secondary">Pricing</a></li> 
            <li class="nav-item"><a href="#" class="nav-link px-2 text-body-secondary">FAQs</a></li> 
            <li class="nav-item"><a href="#" class="nav-link px-2 text-body-secondary">About</a></li> 
        </ul> 
    </footer> 
</div>

```

- The code in [the Bootstrap footer examples](https://getbootstrap.com/docs/5.3/examples/footers/) was implemented by Bootstrap
- [Bootstrap](https://getbootstrap.com/docs/5.3/examples/footers/)'s Code was used because it saved time creating a footer and makes the page look better.
- [Bootstrap](https://getbootstrap.com/docs/5.3/examples/footers/)'s Code was modified by Ben S.