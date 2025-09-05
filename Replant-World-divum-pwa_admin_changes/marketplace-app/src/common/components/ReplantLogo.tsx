export function ReplantLogo() {
  return (
    <>
      <img
        className='dark:hidden w-50  max-h-14'
        src='replant_logo_black.png'
      />
      <img
        className='hidden dark:block max-h-14'
        src='replant_logo_white.png'
      />
    </>
  );
}
