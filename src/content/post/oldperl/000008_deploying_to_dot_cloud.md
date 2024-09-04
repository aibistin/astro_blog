---
title: "Deploying A Perl Application to dotCloud"
publishDate: "24 August 2013"
description: "Deploying My Perl Application to dotCloud. Now known as Docker"
slug: deploying-to-dot-cloud
tags: [ "perl", "dotCloud", "dancer", "docker"]
draft: false
---

## Deploying My Perl Application to dotCloud

**Note**: dotCloud has since been renamed to [docker or “docker hub”](https://hub.docker.com/)

[dotCloud](https://www.dotcloud.com/ "dotCloud") provides an easy way for you to show your Web application to the world.

This is how I deployed my [Moving Company Travel Time Calculator](http://www.carryonmoving.net/quick "CarryOnMoving Net") on dotCloud.

Create the dotCloud application.

```bash title="Create command and its output"
dotcloud create traveltime
> Creating a live application named "traveltime"
> Application "traveltime" created.
> Connect the current directory to "traveltime"? [Y/n]: Y
> Connecting with the application "traveltime" title="dotCloud deploy"
> Connected with default push options: --rsync
```

It looks like the application has been created. I then created a YAML configuration file.yml”.

```yaml title="dotcloud.yml"
www:
  type: perl
  approot: traveltime
  requirements:
    - App::cpanminus
```

Then connect..

```bash title="Connect"
> dotcloud connect traveltime
> Connecting with the application "traveltime"
> Connected with default push options: --rsync
```

I need to tell “app.psgi” who my Dancer2 script is.

```perl frame="none"
require 'bin/app.pl';
app.psgi
```

Then deploy the application

```bash title="dotCloud deploy"
dotcloud push
# Pushing code with rsync from "./" to application traveltime
> building file list ... done
> ./
> dotcloud.yml
> .dotcloud/
> .dotcloud/config
> traveltime/
> traveltime/Changes
> traveltime/MANIFEST
> traveltime/MANIFEST.SKIP
> traveltime/Makefile.PL
> traveltime/README.pod
> ...
> 14:34:17.360184: [www] Successfully installed Dancer2-0.04
> 14:34:17.539632: [www] Installed dependencies for .. Finishing.
> 14:34:17.540369: [www] 49 distributions installed
> 14:34:22.529592: [www] Build completed successfully. Compiled image size is 11MB
> 14:34:22.548716: [www] Build successful for service (www)
> 14:34:22.563869: Application (traveltime) build is done
> 14:34:22.582326: . Now known as Docker Provisioning services... (This may take a few minutes)
> 14:34:22.599485: [www] Using default scaling for service www (1 instance(s)).
> 14:34:22.651213: [www] Using limits for service "www": ram=64M
> 14:34:22.696068: [<www.0>] Provisioning service (www) instance #0
> 14:34:27.002331: --All services instances have been provisioned. Installing code...
> 14:34:27.015045:  Installing build revision rsync-1371306712243 for service (www) instance                    #0
> 14:34:34.852233: [<www.0>] Running postinstall script...
> 14:34:35.582842: [<www.0>] Launching...
> 14:34:36.905954: [<www.0>] Waiting for the instance to become responsive...
> 14:34:37.910787: [<www.0>] Re-routing traffic to the new build...
> 14:34:38.031666: [<www.0>] Successfully installed build revision rsync-1371306712243 for service  (www) instance #0
> 14:34:38.039928: [<www.0>] Installation successful for service (www) instance #0
> 14:34:38.043176: --Application (traveltime) fully installed
> Application is live at <http://traveltime-aibistin.dotcloud.com>
> [10:34 - 0.20]
> traveltime;
```

I then checked the URL <http://traveltime-aibistin.dotcloud.com>, which gave me an error.  

```bash frame="none"
uWSGI Error   Perl application not found
```
  
So off to the log files to check what went wrong.

```bash title="dotcloud logs www"
[<www.0>] == /var/log/supervisor/supervisord.log ==
...
cloud/rsync-1371314776610/traveltime/config.conf: Cannot load /home/dotcloud/rsync-1371314776610/traveltime/config.conf: required support modules are not available.
[<www.0>] Please install Config::General at /home/dotcloud/perl5/lib/perl5/Dancer2/Core/Role/Config.pm line 97
[<www.0>]  at (eval 35) line 19
[<www.0>] BEGIN failed--compilation aborted at bin/app.pl line 3.
...
[<www.0>] == /var/log/nginx/access.log ==
```

So it looks like dotCloud couldn’t find Config::General CPAN module. It looks like I didn’t do such a good job managing my modules dependencies. I could have used the Behemoth of Module creation [Dist::Zilla](https://metacpan.org/module/Dist::Zilla "Dist::Zilla") to do this. However as this is not an app that I wish to upload to CPAN, or install on my laptop I wanted an easier way.

I came across this new [“Bundle I searched the](https://metacpan.org/module/Carton "Carton") [CPAN](https://metacpan.org/ "Meta CPAN")for another way. r for Perl” developed by the prolific and excellent Pearl developer [Tatsuhiko Miyagawa](https://metacpan.org/author/MIYAGAWA "Tatsuhiko Miyagawa"). So I figured it must be good. And it is. I won’t bore you with the details here, as you can read his documentation yourself.

I now seem to have all my dependencies in order and I ran the “dotcloud push” command again. I ran into another problem. I was running Perl 5.12 on my Ubuntu laptop, and dotCloud needs at least Perl 5.14. Well I guess it was about time that I upgraded my Perl version. This took a while, as I decided to load [perlbrew](/module/GUGOD/App-perlbrew-0.66/bin/perlbrew "Perlbrew") to manage my Perl installations.

I ran into a few glitches here and there, but I finally got it working with lots of help from [KENTNL’s perlbrew blog](http://blog.fox.geek.nz/2010/09/installing-multiple-perls-with.html "Perlbrew Installation"),and a little help from [DA Golden’s blog](http://www.dagolden.com/index.php/2134/how-i-manage-new-perls-with-perlbrew/ "DA Golden perlbrew blog").  
So, it’s time to try again from scratch.

```bash title="dotCloud destroy and create"
dotcloud destroy
> Destroy the application "traveltime"? [y/N]: y
> == Destroying "traveltime"

dotcloud create traveltime
> == Creating a live application named "traveltime"
> == Application "traveltime" created.
> Connect the current directory to "traveltime"? [Y/n]: y
> == Connecting with the application "traveltime"
> == Connected with default push options: --rsync
```

OK, looking good so far. Now, I have my dotCloud **traveltime** application up and running. I’m not too happy with the domain name that I have been issued by dotCloud, **<<http://traveltime-aibistin.dotcloud.com>.  
So, I decided to change this to one that I already have.

```bash title="dotCloud update"
dotcloud domain add www <www.carryonmoving.net>
> == domain "www.carryonmoving.net" created for "www"
> == Now please add the following DNS record:
> <www.carryonmoving.net>. IN CNAME gateway.dotcloud.com.
```

Then update my DNS settings on [CloudFlare](https://www.cloudflare.com/ "Cloudflare") and I’m done.

The “finished” (well almost) App [Moving Company Travel Time Calculator can be viewed here](http://www.carryonmoving.net/quick "CarryOnMoving Net").

## Useful Links

This is where I got lots of helpful advice for this endeavour.

- [dotCloud Perl Tutorial](https://hub.docker.com/_/perl "dotCloud Perl Tutorial")
- [Dancer2 Deployment With dotCloud](https://metacpan.org/module/Dancer::Deployment#Hosting-on-DotCloud "Dancer2 Deployment")
- [Marco Fontani’s Dancer Deployment with dotCloud piece, on blogs.perl.org](http://blogs.perl.org/users/marco_fontani/2011/04/dancing-on-a-cloud-made-of-pearls.html "Marco Fontani Perl Blog")
- [Perl Mongers dotCloud Presentation (which I just found)](http://www.slideshare.net/daoswald/deploying-perl-apps-on-dotcloud "Perl Mongers dotCloud")
- [Phillip Smith’s Catalyst with dotCloud piece, on blogs.perl.org](http://blogs.perl.org/users/phillip_smith/2011/08/dotcloud-loves-catalyst-apps-up-and-running-in-10-minutes-perl-in-the-cloud-part-iii.html "Catalyst dotCloud blog")
- [Me on Linkedin](https://www.linkedin.com/in/austin-kenny-87515311/)  
- [The GitHub repo for this app](https://github.com/aibistin/TravelTime)
