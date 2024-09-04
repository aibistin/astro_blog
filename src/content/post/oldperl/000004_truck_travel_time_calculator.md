---
title: "Truck Travel Time Calculator"
publishDate: "25 August 2013"
description: "Truck Travel Time Calculator with Perl and Google Travel Time Matrix"
slug: truck-traveltime-calculator-perl-google-matrix 
tags: [ "perl", "ajax", "google", "javascript", "jQuery", "dancer", "traveltime"]
draft: false
---

## New York City Household Furniture Moving Travel Time Calculator

My next project is to create a travel time calculator application using Dancer2. Hopefully, this would be useful to any household furniture moving company operating in New York City.  
When charging for the travel time between two locations, many New York City Moving companies use the following DOT guidelines.

1. 1/2 an hour within any borough.
2. 3/4 an hour from one borough to another.
3. 1 hour for the first 20 miles between locations that either start or end within New York City
4. 1 hour for each 40 miles after the first 20 miles, which is equivalent to 15 minutes for each 10 miles.

Most of the information that I need to get the distances between locations is freely available from Google’s [Distance Matrix API](https://developers.google.com/maps/documentation/distancematrix/ "Google Distance Matrix API"). I checked out CPAN to see if there was a suitable module available to access this API. There were some that partially did what I required, but not all of what I required.  
I decided to write my own, which you can read about [here](https://www.aibistin.com/?p=290 "Google Distance Matrix API Module Story").

## Forms

### Form To Input Addresses

There are two methods of User Input that I wanted to experiment with. The first is by means of a form where you would enter the exact origin and destination addresses. I describe this in detail [here](https://www.aibistin.com/?p=427 "FormHandler Address Form Post").  
The second method, using jQuery autocomplete, I discuss [here](https://www.aibistin.com/?p=389 "Bootstrap Typeahead Post").

Dancer2 Application TravelTime

The Perl App that implements the [Travel Time Calculator](https://github.com/aibistin/TravelTime "TravelTime")

I used the Perl [Dancer2](https://metacpan.org/module/Dancer2) framework for building this application. Dancer2 bills itself as a “Lightweight yet powerful web application framework”, which I guess is true. It works well for me and is not too complex. I did run into a few bugs which seem to have been ironed out in the very latest version. So, it does have an active group of developers who are maintaining and upgrading this software. Thank you for that.  
Here is an excerpt from this module, showing one particular route handler. This particular one handles an Ajax call to provide a list of cities that match a specific search criteria. The Dancer2::Plugin::Ajax helps out with this method. The caller in this case is a JavaScript program that I use to implement a jQuery autocomplete input field. You can read about this [here](https://www.aibistin.com/?p=389  "City State County Ajax call using Bootstrap Typeahead")

```perl title="Dancer2 ajax handler"
# -------------------------------------------------------------------------------
# Get a list of city, states and counties
# -------------------------------------------------------------------------------
ajax '/city_states' => sub {
    #-      Trim  whitespace from lhs and append the '%' SQL match char.
    #       This will handle searches like 'Sunn,      New York' (Sunnyside, New York)
    #       or                             'Kew Gar,      New York' (Kew Gardens,  New York)
    #       or                             'Kew,New York'
    my @find_params =
      map { $_ =~ s/^\\s+//; s/\\s+\\z//; $_ . '%' }
      split( ',', params->{find} );
    debug 'The find params array now contains : ' . dump @find_params;

    my $csc_arr;
    #------ Allow some short cuts for the Big Apple
    if ( $find_params[0] =~ /^(nyc|manhattan|base)%\\z/i ) {
        $csc_arr->[0] = [ 'New York City', 'New York', 'New York County' ];
    }
    else {
        #----- Search DB for City and Counties matching the search params.
        connect_to_cities() unless $DBH;
        process_error( { Error => 'Unable to connect to the City, State,
                county database! Please try later!', } ) unless $DBH;
        $csc_arr = select_city_state_cty( $DBH, \\@find_params );
    }

    #------ Returns sorted list of Cities, States and Counties to
    #       city-states.js
    { city_states => $csc_arr };
};
```

Have a look at the entire Application code on [GitHub](https://github.com/aibistin/TravelTime "TravelTime Dancer2 web application").  
For a live demo, here is the [Moving Truck Travel Time Calculator](http://www.carryonmoving.net/quick "CarryOnMoving.net") application running on the [dotCloud](https://www.dotcloud.com/ "dotCloud") hosting service.  
[This is how I deployed my Dancer2 Application to dotCloud](http://www.aibistin.com/posts/000010_deploying_to_dot_cloud/  "Deploy To dotCloud").

#### Links

- [Perl](http://www.perl.org)
- [Dancer2](https://metacpan.org/module/Dancer2) a lightweight web application framework
- [Template Toolkit](https://metacpan.org/pod/Template::Toolkit)
- [HTML::FormHandler](https://metacpan.org/pod/HTML::FormHandler)
- [Bootstrap](https://getbootstrap.com/1.0.0/)
- [Me on Linkedin](https://www.linkedin.com/in/austin-kenny-87515311/)  
- [GitHub Repo](https://github.com/aibistin/Mover-Form-Travel-Matrix)
