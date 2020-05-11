const ctx: Worker = self as any;

ctx.addEventListener('message', (e: any) => {
  const { keyword, matchingInstitutionsList } = e.data;
  const result = matchingInstitutionsList
    ?.slice(0, 15)
    .map((institution: any, key: number) => {
      const { name, id } = institution;
      const country = `<span class='theme-color-tertiary-lighter'>${institution.country}</span>`;
      const highlighted = `${name.replace(
        new RegExp(`(${keyword.trim()})`, 'i'),
        `<span class='theme-color-secondary-darker'>$1</span>`
      )}, ${country}`.replace(/<\/?script>/gi, '');

      return { name, id, html: highlighted };
    });

  ctx.postMessage(result);
});

export default {};
