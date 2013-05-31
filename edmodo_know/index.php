<?php
/**
 * Created by JetBrains PhpStorm.
 * User: doug
 * Date: 4/16/13
 * Time: 2:43 PM
 * To change this template use File | Settings | File Templates.
 */

$foo = 5;
$FLAGS = array();
$FLAGS['ie'] = FALSE;

$MAIN_PREFIX = '/edmodo_know';
$RESOURCE_PREFIX = $MAIN_PREFIX . "/static";

$stylesheets = array(
  $RESOURCE_PREFIX . '/styles/dummy.css',
  $RESOURCE_PREFIX . '/styles/dummy2.css',
);
$scripts = array(
  $RESOURCE_PREFIX . '/scripts/dummy.js',
  $RESOURCE_PREFIX . '/scripts/dummy2.js',
);
?>


<html>
<head>
  <title>EdmodoKnow</title>
    <meta name="google-site-verification" content="hb_3Eh52yKeZ4mkATTc1bWORlfadW315Nu2pLE9LVLM" />
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
  <?php if ($PHP_FLAGS['ie']) { ?>
    <meta http-equiv="X-UA-Compatible" content="chrome=1">
  <?php } ?>

  <?php if ($PHP_FLAGS['deviceType'] == 'android') { ?>
    <meta name="viewport" content="width=device-width, height=device-height, initial-scale=1.0, maximum-scale=1.0, target-densityDpi=device-dpi" />
  <?php } else { ?>
    <?php if ($PHP_FLAGS['deviceType'] == 'ios') { ?>
      <meta name="viewport" content="user-scalable=no, width=device-width">
      <meta name="apple-mobile-web-app-capable" content="yes">
      <meta name="apple-mobile-web-app-status-bar-style" content="black">
      <link rel="apple-touch-icon-precomposed" sizes="72x72"
            href="static/images/Logos/icon-72.png" />
      <link rel="apple-touch-startup-image" href="static/images/launch.png">
    <?php } else {  ?>
      <?php if ($PHP_FLAGS['deviceType'] == 'desktop') { ?>
        <meta name="viewport" content="user-scalable=no, width=device-width">
      <?php }  ?>
      <link rel="icon" href="/static/images/Logos/favicon.ico" type="image/x-icon">
      <link rel="shortcut icon" href="/static/images/Logos/favicon.ico" type="image/x-icon">
    <?php }  ?>
  <?php }  ?>


  <?php foreach ($stylesheets as $stylesheet) { echo $stylesheets; ?>
    <link rel=stylesheet href="<?php echo $stylesheet ?>" type="text/css">
  <?php } ?>

  <?php foreach ($scripts as $script) { ?>
    <script src="<?php echo $script ?>" type="text/javascript"></script>
  <?php } ?>


<script type="text/javascript" charset="utf-8">
  var devLogger = common.util.devLogger;

  $(document).ready(function() {
    alert('document is ready!');
  });
</script>

</head>

<body >
<?php
echo "I love you!<br>";
echo "I love you still so much??!<br>";
echo "I love you!2<br>";
echo "I love you!3<br>";
?>

echo 'your majesty rocks all day longer';
</body>
</html>






